import { DomainEvent } from "@/shared/events";

export class InternalNoteUpdatedDomainEvent extends DomainEvent {
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
