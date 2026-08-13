import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class AvatarRemovedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.AVATAR_REMOVED;

	constructor(public readonly userId: string) {
		super();
	}
}
