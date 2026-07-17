import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export class UserPasswordChangedDomainEvent extends DomainEvent {
	constructor(public readonly email: string) {
		super();
	}
}
