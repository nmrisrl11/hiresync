import { ApplicationStatus } from "@/recruitment/domain/types";

export class GetEmployerApplicationsQuery {
	constructor(
		public readonly employerId: string,
		public readonly limit: number,
		public readonly offset: number,
		public readonly jobListingId?: string,
		public readonly status?: ApplicationStatus,
	) {}
}

export type EmployerJobApplicationResult = {
	id: string;
	jobListingId: string;
	applicantId: string;
	status: ApplicationStatus;
	resumeUrl: string;
	coverLetterUrl: string | null;
	appliedAt: Date;
	updatedAt: Date;
};

export abstract class GetEmployerApplicationsUseCasePort {
	abstract execute(
		query: GetEmployerApplicationsQuery,
	): Promise<{ items: EmployerJobApplicationResult[]; total: number }>;
}
