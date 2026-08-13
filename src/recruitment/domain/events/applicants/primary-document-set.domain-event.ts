import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class PrimaryDocumentSetDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.PRIMARY_DOCUMENT_SET;

	constructor(
		public readonly applicantId: string,
		public readonly documentId: string,
	) {
		super();
	}
}
