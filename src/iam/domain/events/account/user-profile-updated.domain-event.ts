import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class UserProfileUpdatedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.USER_PROFILE_UPDATED;

	constructor(
		public readonly userId: string,
		public readonly nameUpdated: boolean,
		public readonly imageUpdated: boolean,
	) {
		super();
	}
}
