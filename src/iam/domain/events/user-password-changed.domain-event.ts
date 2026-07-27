import { DomainEvent } from "@/shared/events";

export class UserPasswordChangedDomainEvent extends DomainEvent {
	constructor(public readonly email: string) {
		super();
	}
}
