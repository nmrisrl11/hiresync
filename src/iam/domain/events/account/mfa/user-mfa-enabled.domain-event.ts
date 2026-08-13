import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class UserMfaEnabledDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.USER_MFA_ENABLED;

	constructor(
		public readonly userId: string,
		public readonly email: string,
	) {
		super();
	}
}
