import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class UserAccountDeletionScheduledDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.USER_ACCOUNT_DELETION_SCHEDULED;

	constructor(
		public readonly userId: string,
		public readonly email: string,
		public readonly scheduledForDeletionAt: Date | null,
	) {
		super();
	}
}
