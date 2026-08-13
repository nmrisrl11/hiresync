import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class JobListingExpiredDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.JOB_LISTING_EXPIRED;

	constructor(
		public readonly jobListingId: string,
		public readonly employerId: string,
	) {
		super();
	}
}
