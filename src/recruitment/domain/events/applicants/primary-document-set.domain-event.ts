import { DomainEvent } from "@/shared/events";

export class PrimaryDocumentSetDomainEvent extends DomainEvent {
	constructor(
		public readonly applicantId: string,
		public readonly documentId: string,
	) {
		super();
	}
}
