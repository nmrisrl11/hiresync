import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class UserSessionRevokedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.USER_SESSION_REVOKED;

	constructor(
		public readonly userId: string,
		public readonly sessionId: string,
	) {
		super();
	}
}
