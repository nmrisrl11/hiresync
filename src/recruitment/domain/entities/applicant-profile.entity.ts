import { AggregateRoot } from "@/shared/core";
import {
	ApplicantDocumentDeletedDomainEvent,
	ApplicantDocumentUploadedDomainEvent,
	ApplicantProfileCreatedDomainEvent,
	ApplicantProfileUpdatedDomainEvent,
	PrimaryDocumentSetDomainEvent,
} from "../events/applicants";
import { DocumentNotFoundException, MaxDocumentLimitReachedException } from "../exceptions";
import { DocumentType } from "../types";
import { ApplicantDocumentId, ApplicantId } from "../value-objects";
import { ApplicantDocument } from "./applicant-document.entity";

export class ApplicantProfile extends AggregateRoot {
	public readonly baseUpdatedAt: Date; //! Track original load time for optimistic concurrency

	constructor(
		public readonly id: ApplicantId,
		public readonly userId: string,
		public firstName: string,
		public lastName: string,
		public headline: string | null,
		public bio: string | null,
		private documents: ApplicantDocument[] = [],
		public readonly createdAt: Date,
		public updatedAt: Date,
	) {
		super();
		this.baseUpdatedAt = updatedAt;
	}

	public static create(
		id: ApplicantId,
		userId: string,
		firstName: string,
		lastName: string,
		headline: string | null = null,
		bio: string | null = null,
	): ApplicantProfile {
		const now = new Date();

		const profile = new ApplicantProfile(
			id,
			userId,
			firstName,
			lastName,
			headline,
			bio,
			[],
			now,
			now,
		);

		profile.addDomainEvent(
			new ApplicantProfileCreatedDomainEvent(id.getValue(), firstName, lastName),
		);

		return profile;
	}

	public updateProfile(
		firstName: string,
		lastName: string,
		headline: string | null,
		bio: string | null,
	): void {
		this.firstName = firstName;
		this.lastName = lastName;
		this.headline = headline;
		this.bio = bio;
		this.updatedAt = new Date();

		this.addDomainEvent(new ApplicantProfileUpdatedDomainEvent(this.id.getValue()));
	}

	public getDocuments(): ReadonlyArray<ApplicantDocument> {
		return Object.freeze([...this.documents]);
	}

	public addDocument(document: ApplicantDocument): void {
		const typeDocs = this.documents.filter((d) => d.type === document.type);

		if (typeDocs.length >= 5) throw new MaxDocumentLimitReachedException(document.type);

		const isFirstOfType = typeDocs.length === 0;

		if (isFirstOfType) document.makePrimary();
		else document.removePrimary();

		this.documents.push(document);
		this.updatedAt = new Date();

		this.addDomainEvent(
			new ApplicantDocumentUploadedDomainEvent(
				this.id.getValue(),
				document.id.getValue(),
				document.type,
			),
		);

		if (isFirstOfType) {
			this.addDomainEvent(
				new PrimaryDocumentSetDomainEvent(this.id.getValue(), document.id.getValue()),
			);
		}
	}

	public removeDocument(documentIdVo: ApplicantDocumentId): ApplicantDocument {
		const index = this.documents.findIndex((d) => d.id.equals(documentIdVo));
		if (index === -1) throw new DocumentNotFoundException();

		const [removedDoc] = this.documents.splice(index, 1);

		if (removedDoc.isPrimary) {
			const remainingOfType = this.documents.filter((d) => d.type === removedDoc.type);
			if (remainingOfType.length > 0) {
				const newPrimary = remainingOfType[0];
				newPrimary.makePrimary();

				this.addDomainEvent(
					new PrimaryDocumentSetDomainEvent(this.id.getValue(), newPrimary.id.getValue()),
				);
			}
		}

		this.updatedAt = new Date();

		this.addDomainEvent(
			new ApplicantDocumentDeletedDomainEvent(this.id.getValue(), removedDoc.id.getValue()),
		);

		return removedDoc;
	}

	public setPrimaryDocument(documentIdVo: ApplicantDocumentId, type: DocumentType): void {
		const targetDoc = this.documents.find((d) => d.id.equals(documentIdVo) && d.type === type);

		if (!targetDoc) throw new DocumentNotFoundException();

		this.documents.filter((d) => d.type === type).forEach((d) => d.removePrimary());
		targetDoc.makePrimary();
		this.updatedAt = new Date();

		this.addDomainEvent(
			new PrimaryDocumentSetDomainEvent(this.id.getValue(), targetDoc.id.getValue()),
		);
	}
}
