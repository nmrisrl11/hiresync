import { DomainEvent } from "@/shared/events";

export class PasswordResetRequestedDomainEvent extends DomainEvent {
	constructor(
		public readonly userId: string,
		public readonly email: string,
		public readonly resetToken: string,
		public readonly tokenExpiresInMs: number,
	) {
		super();
	}
}
