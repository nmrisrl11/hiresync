import { DomainEvent } from "@/shared/events";

export class EmailChangeRequestedDomainEvent extends DomainEvent {
	constructor(
		public readonly email: string,
		public readonly changeToken: string,
		public readonly tokenExpiresInMs: number,
	) {
		super();
	}
}
