import { DomainEvent, EVENT_NAMES } from "@/shared/events";
import { ApplicationStatus } from "../../types";

export class JobApplicationStatusUpdatedDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.JOB_APPLICATION_STATUS_UPDATED;
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
