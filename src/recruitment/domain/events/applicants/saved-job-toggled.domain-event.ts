import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class SavedJobToggledDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.SAVED_JOB_TOGGLED;

	constructor(
		public readonly applicantId: string,
		public readonly jobListingId: string,
		public readonly isSaved: boolean,
	) {
		super();
	}
}
