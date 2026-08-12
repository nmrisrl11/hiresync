import { DomainEvent } from "@/shared/events";

export class ApplicantDocumentDeletedDomainEvent extends DomainEvent {
	constructor(
		public readonly applicantId: string,
		public readonly documentId: string,
	) {
		super();
	}
}
