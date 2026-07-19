import { JobListing } from "@/recruitment/domain/entities";
import { JobStatus } from "@/recruitment/domain/types";

export class GetEmployerJobsQuery {
	constructor(
		public readonly userId: string,
		public readonly limit: number,
		public readonly offset: number,
		public readonly status?: JobStatus,
	) {}
}

export abstract class GetEmployerJobsUseCasePort {
	abstract execute(query: GetEmployerJobsQuery): Promise<{ items: JobListing[]; total: number }>;
}
