import { ApplicantProfileRepository, SavedJobRepository } from "@/recruitment/domain/repositories";
import { Injectable } from "@nestjs/common";
import { ApplicantProfileNotFoundException } from "../../exceptions";
import {
	GetSavedJobsQuery,
	GetSavedJobsUseCasePort,
	SavedJobResult,
} from "../../ports/inbound/applicants";

@Injectable()
export class GetSavedJobsUseCase implements GetSavedJobsUseCasePort {
	constructor(
		private readonly savedJobRepository: SavedJobRepository,
		private readonly applicantProfileRepository: ApplicantProfileRepository,
	) {}

	public async execute(
		query: GetSavedJobsQuery,
	): Promise<{ items: SavedJobResult[]; total: number }> {
		const applicant = await this.applicantProfileRepository.findByUserId(query.userId);
		if (!applicant) throw new ApplicantProfileNotFoundException();

		const applicantId = applicant.id.getValue();

		const [jobListings, total] = await Promise.all([
			this.savedJobRepository.getSavedJobsByApplicant(applicantId, query.limit, query.offset),
			this.savedJobRepository.countByApplicant(applicantId),
		]);

		const items: SavedJobResult[] = jobListings.map((job) => ({
			id: job.id.getValue(),
			employerId: job.employerId.getValue(),
			title: job.title,
			locationType: job.location.type,
			locationAddress: job.location.address,
			employmentType: job.employmentType,
			salaryMin: job.salaryRange?.min ?? null,
			salaryMax: job.salaryRange?.max ?? null,
			salaryCurrency: job.salaryRange?.currency ?? "USD",
			status: job.status,
			createdAt: job.createdAt,
		}));

		return { items, total };
	}
}
