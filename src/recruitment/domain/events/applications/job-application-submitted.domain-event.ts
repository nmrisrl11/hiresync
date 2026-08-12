import { DomainEvent } from "@/shared/events";

export class JobApplicationSubmittedDomainEvent extends DomainEvent {
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
