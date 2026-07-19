import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export class JobListingCreatedDomainEvent extends DomainEvent {
	constructor(
		public readonly jobListingId: string,
		public readonly employerId: string,
		public readonly title: string,
	) {
		super();
	}
}
