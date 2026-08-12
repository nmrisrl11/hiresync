import { DomainEvent } from "@/shared/events";

export class OAuthProviderLinkedDomainEvent extends DomainEvent {
	constructor(
		public readonly userId: string,
		public readonly provider: string,
	) {
		super();
	}
}
