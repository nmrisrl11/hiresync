import { DomainEvent } from "@/shared/events";

export class ApplicantDocumentUploadedDomainEvent extends DomainEvent {
	constructor(
		public readonly applicantId: string,
		public readonly documentId: string,
		public readonly type: string,
	) {
		super();
	}
}
