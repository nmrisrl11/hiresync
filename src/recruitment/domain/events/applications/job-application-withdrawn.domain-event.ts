import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class JobApplicationWithdrawnDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.JOB_APPLICATION_WITHDRAWN;
	public readonly actorId: string;

	constructor(
		public readonly applicationId: string,
		public readonly applicantId: string,
		public readonly jobListingId: string,
		public readonly employerId: string,
	) {
		super();
		this.actorId = applicantId;
	}
}
