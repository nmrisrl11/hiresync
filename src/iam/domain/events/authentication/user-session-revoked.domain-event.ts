import { DomainEvent } from "@/shared/events";

export class UserSessionRevokedDomainEvent extends DomainEvent {
	constructor(
		public readonly userId: string,
		public readonly sessionId: string,
	) {
		super();
	}
}
