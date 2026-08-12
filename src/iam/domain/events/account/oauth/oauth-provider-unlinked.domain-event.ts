import { DomainEvent } from "@/shared/events";

export class OAuthProviderUnlinkedDomainEvent extends DomainEvent {
	constructor(
		public readonly userId: string,
		public readonly provider: string,
	) {
		super();
	}
}
