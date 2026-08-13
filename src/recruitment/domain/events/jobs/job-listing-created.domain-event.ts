import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class JobListingCreatedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.JOB_LISTING_CREATED;

	constructor(
		public readonly jobListingId: string,
		public readonly employerId: string,
		public readonly title: string,
	) {
		super();
	}
}
