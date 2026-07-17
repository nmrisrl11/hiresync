import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export class VerificationEmailResentDomainEvent extends DomainEvent {
	constructor(
		public readonly email: string,
		public readonly verificationToken: string,
		public readonly tokenExpiresInMs: number,
	) {
		super();
	}
}
