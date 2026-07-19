import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export class JobListingUpdatedDomainEvent extends DomainEvent {
	constructor(
		public readonly jobListingId: string,
		public readonly employerId: string,
	) {
		super();
	}
}
