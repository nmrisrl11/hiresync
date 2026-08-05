import { EmploymentType, JobStatus, LocationType } from "@/recruitment/domain/types";

export class GetJobListingByIdQuery {
	constructor(public readonly jobId: string) {}
}

export type PublicJobListingResult = {
	id: string;
	employerId: string;
	companyName: string;
	companyLogoUrl: string | null;
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
	postedAt: Date;
};

export abstract class GetJobListingByIdUseCasePort {
	abstract execute(query: GetJobListingByIdQuery): Promise<PublicJobListingResult>;
}
