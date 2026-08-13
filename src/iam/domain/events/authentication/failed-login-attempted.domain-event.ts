import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class FailedLoginAttemptedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.FAILED_LOGIN_ATTEMPTED;

	constructor(
		public readonly email: string,
		public readonly reason: string,
	) {
		super();
	}
}
