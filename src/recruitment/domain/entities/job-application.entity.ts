import { AggregateRoot } from "@/shared/core";
import {
	JobApplicationStatusUpdatedDomainEvent,
	JobApplicationSubmittedDomainEvent,
	JobApplicationWithdrawnDomainEvent,
} from "../events";
import { ApplicationNotUpdatableException } from "../exceptions";
import { APPLICATION_STATUS, ApplicationStatus } from "../types";
import { ApplicantId, EmployerId, JobApplicationId, JobListingId } from "../value-objects";
import { JobApplicationHistory } from "./job-application-history.entity";

export class JobApplication extends AggregateRoot {
	constructor(
		public readonly id: JobApplicationId,
		public readonly applicantId: ApplicantId,
		public readonly jobListingId: JobListingId,
		public readonly employerId: EmployerId,
		public resumeUrl: string,
		public coverLetterUrl: string | null,
		public status: ApplicationStatus,
		public internalNote: string | null,
		private history: JobApplicationHistory[] = [],
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
			null,
			[],
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
				this.employerId.getValue(),
			),
		);
	}

	public withdraw(): void {
		if (
			this.status === APPLICATION_STATUS.HIRED ||
			this.status === APPLICATION_STATUS.REJECTED ||
			this.status === APPLICATION_STATUS.WITHDRAWN
		)
			throw new ApplicationNotUpdatableException();

		this.status = APPLICATION_STATUS.WITHDRAWN;
		this.updatedAt = new Date();

		this.addDomainEvent(
			new JobApplicationWithdrawnDomainEvent(
				this.id.getValue(),
				this.applicantId.getValue(),
				this.jobListingId.getValue(),
				this.employerId.getValue(),
			),
		);
	}

	public updateInternalNote(note: string | null): void {
		this.internalNote = note;
		this.updatedAt = new Date();
	}

	//! Job Application History
	public getHistory(): ReadonlyArray<JobApplicationHistory> {
		return Object.freeze([...this.history]);
	}

	public addHistory(historyRecord: JobApplicationHistory): void {
		this.history.push(historyRecord);
		this.updatedAt = new Date();
	}
}
