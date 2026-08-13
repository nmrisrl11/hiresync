import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class UserRegisteredDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.USER_REGISTERED;

	constructor(
		public readonly userId: string,
		public readonly email: string,
		public readonly verificationToken: string,
		public readonly tokenExpiresInMs: number,
	) {
		super();
	}
}
