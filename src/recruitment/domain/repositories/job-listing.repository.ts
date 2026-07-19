import { JobListing } from "../entities";
import { JobStatus } from "../types";
import { EmployerId, JobListingId } from "../value-objects";

export interface FindJobsFilter {
	status?: JobStatus;
	employerId?: EmployerId;
	searchQuery?: string;
	limit: number;
	offset: number;
}

export abstract class JobListingRepository {
	abstract findById(id: JobListingId): Promise<JobListing | null>;
	abstract findMany(filter: FindJobsFilter): Promise<JobListing[]>;
	abstract count(filter: Omit<FindJobsFilter, "limit" | "offset">): Promise<number>;
	abstract save(jobListing: JobListing): Promise<void>;
	abstract delete(id: JobListingId): Promise<void>;
}
