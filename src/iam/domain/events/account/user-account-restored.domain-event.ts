import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class UserAccountRestoredDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.USER_ACCOUNT_RESTORED;

	constructor(
		public readonly userId: string,
		public readonly email: string,
	) {
		super();
	}
}
