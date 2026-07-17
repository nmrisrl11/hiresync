import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export class UserEmailVerifiedDomainEvent extends DomainEvent {
	constructor(public readonly email: string) {
		super();
	}
}
