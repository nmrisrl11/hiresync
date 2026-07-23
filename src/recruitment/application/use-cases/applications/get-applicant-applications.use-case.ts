import {
	ApplicantProfileRepository,
	JobApplicationRepository,
} from "@/recruitment/domain/repositories";
import { Injectable } from "@nestjs/common";
import {
	GetApplicantApplicationsQuery,
	GetApplicantApplicationsUseCasePort,
	JobApplicationResult,
} from "../../ports/inbound/applications";
import { ApplicantProfileNotFoundException } from "../../exceptions";

@Injectable()
export class GetApplicantApplicationsUseCase implements GetApplicantApplicationsUseCasePort {
	constructor(
		private readonly jobApplicationRepository: JobApplicationRepository,
		private readonly applicantProfileRepository: ApplicantProfileRepository,
	) {}

	public async execute(
		query: GetApplicantApplicationsQuery,
	): Promise<{ items: JobApplicationResult[]; total: number }> {
		const applicant = await this.applicantProfileRepository.findByUserId(query.applicantId);
		if (!applicant) throw new ApplicantProfileNotFoundException();

		const filter = {
			applicantId: applicant.id.getValue(),
			limit: query.limit,
			offset: query.offset,
			status: query.status,
		};

		const [applications, total] = await Promise.all([
			this.jobApplicationRepository.findMany(filter),
			this.jobApplicationRepository.count(filter),
		]);

		const items: JobApplicationResult[] = applications.map((app) => ({
			id: app.id.getValue(),
			jobListingId: app.jobListingId.getValue(),
			employerId: app.employerId.getValue(),
			status: app.status,
			resumeUrl: app.resumeUrl,
			coverLetterUrl: app.coverLetterUrl,
			appliedAt: app.appliedAt,
			updatedAt: app.updatedAt,
		}));

		return { items, total };
	}
}
