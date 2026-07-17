import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export class PasswordResetRequestedDomainEvent extends DomainEvent {
	constructor(
		public readonly email: string,
		public readonly resetToken: string,
		public readonly tokenExpiresInMs: number,
	) {
		super();
	}
}
