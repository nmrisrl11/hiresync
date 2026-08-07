import { DocumentType } from "../types";
import { ApplicantDocumentId, ApplicantId } from "../value-objects";

export class ApplicantDocument {
	constructor(
		public readonly id: ApplicantDocumentId,
		public readonly applicantId: ApplicantId,
		public readonly type: DocumentType,
		public readonly originalFilename: string,
		public readonly fileKey: string,
		public isPrimary: boolean,
		public readonly createdAt: Date,
		public readonly updatedAt: Date,
	) {}

	public makePrimary(): void {
		this.isPrimary = true;
	}

	public removePrimary(): void {
		this.isPrimary = false;
	}
}
