import { JobApplication } from "../entities";
import { ApplicationStatus } from "../types";
import { ApplicantId, JobApplicationId, JobListingId } from "../value-objects";

export interface FindApplicationsFilter {
	limit: number;
	offset: number;
	employerId?: string;
	applicantId?: string;
	jobListingId?: string;
	status?: ApplicationStatus;
}

export abstract class JobApplicationRepository {
	abstract findById(id: JobApplicationId): Promise<JobApplication | null>;
	abstract findByIds(ids: JobApplicationId[]): Promise<JobApplication[]>;

	//! Enforcing the "one application per job" rule
	abstract findByApplicantAndJob(
		applicantId: ApplicantId,
		jobListingId: JobListingId,
	): Promise<JobApplication | null>;

	abstract findAllByApplicantId(applicantId: ApplicantId): Promise<JobApplication[]>;

	abstract findMany(filter: FindApplicationsFilter): Promise<JobApplication[]>;
	abstract count(filter: FindApplicationsFilter): Promise<number>;

	abstract save(application: JobApplication): Promise<void>;
	abstract saveMany(applications: JobApplication[]): Promise<void>;
}
