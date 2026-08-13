import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class InternalNoteUpdatedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.INTERNAL_NOTE_UPDATED;
	public readonly actorId: string;

	constructor(
		public readonly applicationId: string,
		public readonly employerId: string,
		public readonly note: string | null,
	) {
		super();
		this.actorId = employerId; //! Explicitly define the employer as the actor
	}
}
