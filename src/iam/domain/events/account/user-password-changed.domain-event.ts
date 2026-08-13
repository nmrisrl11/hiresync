import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class UserPasswordChangedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.USER_PASSWORD_CHANGED;

	constructor(
		public readonly userId: string,
		public readonly email: string,
	) {
		super();
	}
}
