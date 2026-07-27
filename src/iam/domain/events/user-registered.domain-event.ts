import { DomainEvent } from "@/shared/events";

export class UserRegisteredDomainEvent extends DomainEvent {
	constructor(
		public readonly email: string,
		public readonly verificationToken: string,
		public readonly tokenExpiresInMs: number,
	) {
		super();
	}
}
