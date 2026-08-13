import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class EmployerProfileCreatedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.EMPLOYER_PROFILE_CREATED;

	constructor(
		public readonly employerId: string,
		public readonly companyName: string,
	) {
		super();
	}
}
