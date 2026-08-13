import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class UserEmailVerifiedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.USER_EMAIL_VERIFIED;

	constructor(
		public readonly userId: string,
		public readonly email: string,
	) {
		super();
	}
}
