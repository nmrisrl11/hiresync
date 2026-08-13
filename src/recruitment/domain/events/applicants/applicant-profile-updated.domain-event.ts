import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class ApplicantProfileUpdatedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.APPLICANT_PROFILE_UPDATED;

	constructor(public readonly applicantId: string) {
		super();
	}
}
