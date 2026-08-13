import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class ApplicantProfileCreatedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.APPLICANT_PROFILE_CREATED;

	constructor(
		public readonly applicantId: string,
		public readonly firstName: string,
		public readonly lastName: string,
	) {
		super();
	}
}
