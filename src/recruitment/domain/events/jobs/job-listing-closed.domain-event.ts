import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class JobListingClosedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.JOB_LISTING_CLOSED;

	constructor(
		public readonly jobListingId: string,
		public readonly employerId: string,
		public readonly reason: string,
	) {
		super();
	}
}
