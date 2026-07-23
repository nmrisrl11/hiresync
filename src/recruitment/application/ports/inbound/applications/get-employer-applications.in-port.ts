import { ApplicationStatus } from "@/recruitment/domain/types";
import { JobApplicationResult } from "./get-applicant-applications.in-port";

export class GetEmployerApplicationsQuery {
	constructor(
		public readonly employerId: string,
		public readonly limit: number,
		public readonly offset: number,
		public readonly jobListingId?: string,
		public readonly status?: ApplicationStatus,
	) {}
}

export abstract class GetEmployerApplicationsUseCasePort {
	abstract execute(
		query: GetEmployerApplicationsQuery,
	): Promise<{ items: JobApplicationResult[]; total: number }>;
}
