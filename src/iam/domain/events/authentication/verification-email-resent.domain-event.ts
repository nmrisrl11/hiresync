import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class VerificationEmailResentDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.VERIFICATION_EMAIL_RESENT;

	constructor(
		public readonly userId: string,
		public readonly email: string,
		public readonly verificationToken: string,
		public readonly tokenExpiresInMs: number,
	) {
		super();
	}
}
