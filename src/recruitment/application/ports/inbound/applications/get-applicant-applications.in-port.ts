import { ApplicationStatus } from "@/recruitment/domain/types";

export class GetApplicantApplicationsQuery {
	constructor(
		public readonly applicantId: string,
		public readonly limit: number,
		public readonly offset: number,
		public readonly status?: ApplicationStatus,
	) {}
}

export type JobApplicationResult = {
	id: string;
	jobListingId: string;
	employerId: string;
	status: ApplicationStatus;
	resumeUrl: string;
	coverLetterUrl: string | null;
	appliedAt: Date;
	updatedAt: Date;
};

export abstract class GetApplicantApplicationsUseCasePort {
	abstract execute(
		query: GetApplicantApplicationsQuery,
	): Promise<{ items: JobApplicationResult[]; total: number }>;
}
