import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class ApplicantDocumentUploadedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.APPLICANT_DOCUMENT_UPLOADED;

	constructor(
		public readonly applicantId: string,
		public readonly documentId: string,
		public readonly type: string,
	) {
		super();
	}
}
