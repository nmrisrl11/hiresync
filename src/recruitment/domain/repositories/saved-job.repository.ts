import { JobListing } from "../entities";

export abstract class SavedJobRepository {
	abstract saveJob(applicantId: string, jobListingId: string): Promise<void>;

	abstract removeSavedJob(applicantId: string, jobListingId: string): Promise<void>;

	abstract hasSavedJob(applicantId: string, jobListingId: string): Promise<boolean>;

	//! Returns the actual JobListing entities so the frontend can render the job cards
	abstract getSavedJobsByApplicant(
		applicantId: string,
		limit: number,
		offset: number,
	): Promise<JobListing[]>;

	abstract countByApplicant(applicantId: string): Promise<number>;
}
