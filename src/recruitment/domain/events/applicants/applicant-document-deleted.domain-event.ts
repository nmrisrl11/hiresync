import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class ApplicantDocumentDeletedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.APPLICANT_DOCUMENT_DELETED;

	constructor(
		public readonly applicantId: string,
		public readonly documentId: string,
	) {
		super();
	}
}
