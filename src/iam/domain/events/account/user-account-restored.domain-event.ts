import { DomainEvent } from "@/shared/events";

export class UserAccountRestoredDomainEvent extends DomainEvent {
	constructor(
		public readonly userId: string,
		public readonly email: string,
	) {
		super();
	}
}
