import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class EmployerProfileUpdatedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.EMPLOYER_PROFILE_UPDATED;

	constructor(
		public readonly employerId: string,
		public readonly companyName: string,
	) {
		super();
	}
}
