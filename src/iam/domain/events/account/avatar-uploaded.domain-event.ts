import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class AvatarUploadedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.AVATAR_UPLOADED;

	constructor(
		public readonly userId: string,
		public readonly avatarPublicId: string,
	) {
		super();
	}
}
