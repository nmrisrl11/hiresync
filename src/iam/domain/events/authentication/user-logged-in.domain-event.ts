import { DomainEvent } from "@/shared/events";

export class UserLoggedInDomainEvent extends DomainEvent {
	constructor(
		public readonly userId: string,
		public readonly sessionId: string,
	) {
		super();
	}
}
