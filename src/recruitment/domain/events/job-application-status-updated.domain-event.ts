import { DomainEvent } from "@/shared/events";
import { ApplicationStatus } from "../types";

export class JobApplicationStatusUpdatedDomainEvent extends DomainEvent {
	public readonly actorId: string;

	constructor(
		public readonly applicationId: string,
		public readonly applicantId: string,
		public readonly newStatus: ApplicationStatus,
		public readonly employerId: string,
	) {
		super();
		this.actorId = employerId;
	}
}
