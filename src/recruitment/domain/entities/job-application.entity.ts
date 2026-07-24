import { AggregateRoot } from "@/shared/domain/entities";
import {
	JobApplicationStatusUpdatedDomainEvent,
	JobApplicationSubmittedDomainEvent,
} from "../events";
import { APPLICATION_STATUS, ApplicationStatus } from "../types";
import { ApplicantId, EmployerId, JobApplicationId, JobListingId } from "../value-objects";

export class JobApplication extends AggregateRoot {
	constructor(
		public readonly id: JobApplicationId,
		public readonly applicantId: ApplicantId,
		public readonly jobListingId: JobListingId,
		public readonly employerId: EmployerId,
		public resumeUrl: string,
		public coverLetterUrl: string | null,
		public status: ApplicationStatus,
		public readonly appliedAt: Date,
		public updatedAt: Date,
	) {
		super();
	}

	public static submit(
		id: JobApplicationId,
		applicantId: ApplicantId,
		jobListingId: JobListingId,
		employerId: EmployerId,
		resumeUrl: string,
		coverLetterUrl: string | null = null,
	): JobApplication {
		const now = new Date();

		const application = new JobApplication(
			id,
			applicantId,
			jobListingId,
			employerId,
			resumeUrl,
			coverLetterUrl,
			APPLICATION_STATUS.PENDING,
			now,
			now,
		);

		application.addDomainEvent(
			new JobApplicationSubmittedDomainEvent(
				id.getValue(),
				applicantId.getValue(),
				jobListingId.getValue(),
				employerId.getValue(),
			),
		);

		return application;
	}

	public updateStatus(newStatus: ApplicationStatus): void {
		if (this.status === newStatus) return;

		this.status = newStatus;
		this.updatedAt = new Date();

		this.addDomainEvent(
			new JobApplicationStatusUpdatedDomainEvent(
				this.id.getValue(),
				this.applicantId.getValue(),
				this.status,
			),
		);
	}
}
