import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class UserMfaDisabledDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.USER_MFA_DISABLED;

	constructor(
		public readonly userId: string,
		public readonly email: string,
	) {
		super();
	}
}
