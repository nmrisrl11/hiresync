import { DomainEvent } from "@/shared/events";

export class UserMfaDisabledDomainEvent extends DomainEvent {
	constructor(
		public readonly userId: string,
		public readonly email: string,
	) {
		super();
	}
}
