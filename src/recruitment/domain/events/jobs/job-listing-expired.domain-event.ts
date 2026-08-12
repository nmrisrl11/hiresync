import { DomainEvent } from "@/shared/events";

export class JobListingExpiredDomainEvent extends DomainEvent {
	constructor(
		public readonly jobListingId: string,
		public readonly employerId: string,
	) {
		super();
	}
}
