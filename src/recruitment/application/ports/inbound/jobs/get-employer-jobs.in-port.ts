import { EmploymentType, JobStatus, LocationType } from "@/recruitment/domain/types";

export class GetEmployerJobsQuery {
	constructor(
		public readonly userId: string,
		public readonly limit: number,
		public readonly offset: number,
		public readonly status?: JobStatus,
	) {}
}

export type EmployerJobListingResult = {
	id: string;
	employerId: string;
	title: string;
	description: string;
	requirements: string[];
	employmentType: EmploymentType;
	locationType: LocationType;
	locationAddress: string | null;
	salaryMin: number | null;
	salaryMax: number | null;
	salaryCurrency: string;
	status: JobStatus;
	createdAt: Date;
	expiresAt: Date | null;
};

export abstract class GetEmployerJobsUseCasePort {
	abstract execute(
		query: GetEmployerJobsQuery,
	): Promise<{ items: EmployerJobListingResult[]; total: number }>;
}
