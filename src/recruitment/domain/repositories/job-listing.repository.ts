import { JobListing } from "../entities";
import { EmploymentType, JobStatus, LocationType } from "../types";
import { EmployerId, JobListingId } from "../value-objects";

export interface FindJobsFilter {
	limit: number;
	offset: number;
	status?: JobStatus;
	employerId?: EmployerId;
	searchQuery?: string;
	employmentType?: EmploymentType;
	locationType?: LocationType;
}

export abstract class JobListingRepository {
	abstract findById(id: JobListingId): Promise<JobListing | null>;
	abstract findMany(filter: FindJobsFilter): Promise<JobListing[]>;
	abstract findExpirableListings(referenceDate: Date): Promise<JobListing[]>;
	abstract count(filter: Omit<FindJobsFilter, "limit" | "offset">): Promise<number>;
	abstract save(jobListing: JobListing): Promise<void>;
	abstract delete(id: JobListingId): Promise<void>;
}
