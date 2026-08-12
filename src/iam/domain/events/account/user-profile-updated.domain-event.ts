import { DomainEvent } from "@/shared/events";

export class UserProfileUpdatedDomainEvent extends DomainEvent {
	constructor(
		public readonly userId: string,
		public readonly nameUpdated: boolean,
		public readonly imageUpdated: boolean,
	) {
		super();
	}
}
