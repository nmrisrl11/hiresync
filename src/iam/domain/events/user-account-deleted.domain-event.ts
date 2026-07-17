import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export class UserAccountDeletedDomainEvent extends DomainEvent {
	constructor(
		public readonly userId: string,
		public readonly email: string,
		public readonly avatarImage: string | null,
	) {
		super();
	}
}
