import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class CompanyLogoUploadedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.COMPANY_LOGO_UPLOADED;

	constructor(
		public readonly employerId: string,
		public readonly logoPublicId: string,
	) {
		super();
	}
}
