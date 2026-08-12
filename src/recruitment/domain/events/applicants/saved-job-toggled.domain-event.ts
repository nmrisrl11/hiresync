import { DomainEvent } from "@/shared/events";

export class SavedJobToggledDomainEvent extends DomainEvent {
	constructor(
		public readonly applicantId: string,
		public readonly jobListingId: string,
		public readonly isSaved: boolean,
	) {
		super();
	}
}
