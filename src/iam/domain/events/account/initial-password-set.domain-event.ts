import { DomainEvent } from "@/shared/events";

export class InitialPasswordSetDomainEvent extends DomainEvent {
	constructor(public readonly userId: string) {
		super();
	}
}
