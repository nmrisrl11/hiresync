import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class EmailChangeRequestedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.EMAIL_CHANGE_REQUESTED;

	constructor(
		public readonly userId: string,
		public readonly email: string,
		public readonly changeToken: string,
		public readonly tokenExpiresInMs: number,
	) {
		super();
	}
}
