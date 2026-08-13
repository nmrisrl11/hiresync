import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class UserLoggedInDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.USER_LOGGED_IN;

	constructor(
		public readonly userId: string,
		public readonly sessionId: string,
	) {
		super();
	}
}
