import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export class JobListingClosedDomainEvent extends DomainEvent {
	constructor(
		public readonly jobListingId: string,
		public readonly employerId: string,
		public readonly reason: string,
	) {
		super();
	}
}
