import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class UserAccountDeletedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.USER_ACCOUNT_DELETED;

	constructor(
		public readonly userId: string,
		public readonly email: string,
		public readonly avatarImage: string | null,
	) {
		super();
	}
}
