import { DomainEvent } from "@/shared/events";

export class UserAccountDeletionScheduledDomainEvent extends DomainEvent {
	constructor(
		public readonly userId: string,
		public readonly email: string,
		public readonly scheduledForDeletionAt: Date | null,
	) {
		super();
	}
}
