import { DomainEvent } from "@/shared/events";

export class UserEmailChangedDomainEvent extends DomainEvent {
	constructor(
		public readonly oldEmail: string,
		public readonly newEmail: string,
	) {
		super();
	}
}
