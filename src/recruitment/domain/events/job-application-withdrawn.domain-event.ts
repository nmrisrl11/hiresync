import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export class JobApplicationWithdrawnDomainEvent extends DomainEvent {
	constructor(
		public readonly applicationId: string,
		public readonly applicantId: string,
		public readonly jobListingId: string,
		public readonly employerId: string,
	) {
		super();
	}
}
