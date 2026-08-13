import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class CompanyLogoRemovedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.COMPANY_LOGO_REMOVED;

	constructor(public readonly employerId: string) {
		super();
	}
}
