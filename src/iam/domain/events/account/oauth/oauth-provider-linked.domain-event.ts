import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class OAuthProviderLinkedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.OAUTH_PROVIDER_LINKED;

	constructor(
		public readonly userId: string,
		public readonly provider: string,
	) {
		super();
	}
}
