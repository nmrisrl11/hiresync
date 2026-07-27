import { DomainEvent } from "@/shared/events";

export class UserEmailVerifiedDomainEvent extends DomainEvent {
	constructor(public readonly email: string) {
		super();
	}
}
