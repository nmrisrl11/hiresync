import { DomainEvent } from "@/shared/events";

export class AvatarUploadedDomainEvent extends DomainEvent {
	constructor(
		public readonly userId: string,
		public readonly avatarUrl: string,
	) {
		super();
	}
}
