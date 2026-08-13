import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class InitialPasswordSetDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.INITIAL_PASSWORD_SET;

	constructor(public readonly userId: string) {
		super();
	}
}
