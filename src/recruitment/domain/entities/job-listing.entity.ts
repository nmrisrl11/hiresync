import { AggregateRoot } from "@/shared/core";
import {
	JobListingClosedDomainEvent,
	JobListingCreatedDomainEvent,
	JobListingUpdatedDomainEvent,
} from "../events/jobs";
import { JobAlreadyClosedException, JobNotUpdatableException } from "../exceptions";
import { EmploymentType, JOB_STATUS, JobStatus } from "../types";
import { EmployerId, JobListingId, JobLocation, SalaryRange } from "../value-objects";

export class JobListing extends AggregateRoot {
	constructor(
		public readonly id: JobListingId,
		public readonly employerId: EmployerId,
		public title: string,
		public description: string,
		public requirements: string[],
		public employmentType: EmploymentType,
		public location: JobLocation,
		public salaryRange: SalaryRange | null,
		public status: JobStatus,
		public expiresAt: Date,
		public readonly createdAt: Date,
		public updatedAt: Date,
	) {
		super();
	}

	public static create(
		id: JobListingId,
		employerId: EmployerId,
		title: string,
		description: string,
		requirements: string[],
		employmentType: EmploymentType,
		location: JobLocation,
		salaryRange: SalaryRange | null,
		expiresAt: Date,
	): JobListing {
		const now = new Date();

		const jobListing = new JobListing(
			id,
			employerId,
			title,
			description,
			requirements,
			employmentType,
			location,
			salaryRange,
			JOB_STATUS.PUBLISHED,
			expiresAt,
			now,
			now,
		);

		jobListing.addDomainEvent(
			new JobListingCreatedDomainEvent(id.getValue(), employerId.getValue(), title),
		);

		return jobListing;
	}

	public update(
		title: string,
		description: string,
		requirements: string[],
		employmentType: EmploymentType,
		location: JobLocation,
		salaryRange: SalaryRange | null,
	): void {
		if (this.status === JOB_STATUS.CLOSED || this.status === JOB_STATUS.EXPIRED)
			throw new JobNotUpdatableException();

		this.title = title;
		this.description = description;
		this.requirements = requirements;
		this.employmentType = employmentType;
		this.location = location;
		this.salaryRange = salaryRange;
		this.updatedAt = new Date();

		this.addDomainEvent(
			new JobListingUpdatedDomainEvent(this.id.getValue(), this.employerId.getValue()),
		);
	}

	public close(reason: string = "Role filled or cancelled by employer"): void {
		if (this.status === JOB_STATUS.CLOSED) throw new JobAlreadyClosedException();

		this.status = JOB_STATUS.CLOSED;
		this.updatedAt = new Date();

		this.addDomainEvent(
			new JobListingClosedDomainEvent(this.id.getValue(), this.employerId.getValue(), reason),
		);
	}

	public expire(): void {
		if (this.status === JOB_STATUS.EXPIRED || this.status === JOB_STATUS.CLOSED) return;

		this.status = JOB_STATUS.EXPIRED;
		this.updatedAt = new Date();

		this.addDomainEvent(
			new JobListingClosedDomainEvent(
				this.id.getValue(),
				this.employerId.getValue(),
				"Job listing reached its expiration date",
			),
		);
	}
}
