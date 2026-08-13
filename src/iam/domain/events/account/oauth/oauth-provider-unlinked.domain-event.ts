import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class OAuthProviderUnlinkedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.OAUTH_PROVIDER_UNLINKED;

	constructor(
		public readonly userId: string,
		public readonly provider: string,
	) {
		super();
	}
}
