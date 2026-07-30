import { DomainEvent } from "@/shared/events";

export class UserMfaEnabledDomainEvent extends DomainEvent {
	constructor(public readonly email: string) {
		super();
	}
}
