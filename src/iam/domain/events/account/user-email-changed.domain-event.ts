import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class UserEmailChangedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.USER_EMAIL_CHANGED;

	constructor(
		public readonly userId: string,
		public readonly oldEmail: string,
		public readonly newEmail: string,
	) {
		super();
	}
}
