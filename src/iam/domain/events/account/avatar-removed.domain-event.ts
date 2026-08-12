import { DomainEvent } from "@/shared/events";

export class AvatarRemovedDomainEvent extends DomainEvent {
	constructor(public readonly userId: string) {
		super();
	}
}
