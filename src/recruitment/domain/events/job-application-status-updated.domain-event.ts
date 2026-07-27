import { DomainEvent } from "@/shared/events";
import { ApplicationStatus } from "../types";

export class JobApplicationStatusUpdatedDomainEvent extends DomainEvent {
	constructor(
		public readonly applicationId: string,
		public readonly applicantId: string,
		public readonly newStatus: ApplicationStatus,
	) {
		super();
	}
}
