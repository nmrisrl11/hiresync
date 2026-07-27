import { DomainEvent } from "@/shared/events";

export class JobListingClosedDomainEvent extends DomainEvent {
	constructor(
		public readonly jobListingId: string,
		public readonly employerId: string,
		public readonly reason: string,
	) {
		super();
	}
}
