import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export class UserEmailChangedDomainEvent extends DomainEvent {
	constructor(
		public readonly oldEmail: string,
		public readonly newEmail: string,
	) {
		super();
	}
}
