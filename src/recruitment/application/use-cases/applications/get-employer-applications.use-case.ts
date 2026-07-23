import { JobApplicationRepository } from "@/recruitment/domain/repositories";
import { Injectable } from "@nestjs/common";
import {
	GetEmployerApplicationsQuery,
	GetEmployerApplicationsUseCasePort,
	JobApplicationResult,
} from "../../ports/inbound/applications";

@Injectable()
export class GetEmployerApplicationsUseCase implements GetEmployerApplicationsUseCasePort {
	constructor(private readonly jobApplicationRepository: JobApplicationRepository) {}

	public async execute(
		query: GetEmployerApplicationsQuery,
	): Promise<{ items: JobApplicationResult[]; total: number }> {
		const filter = {
			employerId: query.employerId,
			jobListingId: query.jobListingId,
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
