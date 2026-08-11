import { DomainEvent } from "@/shared/events";

export class UserPasswordChangedDomainEvent extends DomainEvent {
	constructor(
		public readonly userId: string,
		public readonly email: string,
	) {
		super();
	}
}
