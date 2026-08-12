import { DomainEvent } from "@/shared/events";

export class FailedLoginAttemptedDomainEvent extends DomainEvent {
	constructor(
		public readonly email: string,
		public readonly reason: string,
	) {
		super();
	}
}
