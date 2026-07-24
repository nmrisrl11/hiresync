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
	locationType: string;
	locationAddress: string | null;
	employmentType: string;
	salaryMin: number | null;
	salaryMax: number | null;
	salaryCurrency: string;
	status: string;
	createdAt: Date;
};

export abstract class GetSavedJobsUseCasePort {
	abstract execute(query: GetSavedJobsQuery): Promise<{ items: SavedJobResult[]; total: number }>;
}
