import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class PasswordResetRequestedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.PASSWORD_RESET_REQUESTED;

	constructor(
		public readonly userId: string,
		public readonly email: string,
		public readonly resetToken: string,
		public readonly tokenExpiresInMs: number,
	) {
		super();
	}
}
