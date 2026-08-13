import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class JobListingUpdatedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.JOB_LISTING_UPDATED;

	constructor(
		public readonly jobListingId: string,
		public readonly employerId: string,
	) {
		super();
	}
}
