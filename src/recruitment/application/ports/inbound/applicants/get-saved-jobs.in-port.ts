import { EmploymentType, JobStatus, LocationType } from "@/recruitment/domain/types";

export class GetSavedJobsQuery {
	constructor(
		public readonly userId: string,
		public readonly limit: number,
		public readonly offset: number,
	) {}
}

export type SavedJobResult = {
	id: string;
	employerId: string;
	title: string;
	locationType: LocationType;
	locationAddress: string | null;
	employmentType: EmploymentType;
	salaryMin: number | null;
	salaryMax: number | null;
	salaryCurrency: string;
	status: JobStatus;
	createdAt: Date;
};

export abstract class GetSavedJobsUseCasePort {
	abstract execute(query: GetSavedJobsQuery): Promise<{ items: SavedJobResult[]; total: number }>;
}
