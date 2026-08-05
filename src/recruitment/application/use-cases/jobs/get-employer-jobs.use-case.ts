import {
	EmployerProfileRepository,
	FindJobsFilter,
	JobListingRepository,
} from "@/recruitment/domain/repositories";
import { Injectable } from "@nestjs/common";
import { EmployerProfileNotFoundException } from "../../exceptions";
import {
	EmployerJobListingResult,
	GetEmployerJobsQuery,
	GetEmployerJobsUseCasePort,
} from "../../ports/inbound/jobs";

@Injectable()
export class GetEmployerJobsUseCase implements GetEmployerJobsUseCasePort {
	constructor(
		private readonly jobListingRepository: JobListingRepository,
		private readonly employerProfileRepository: EmployerProfileRepository,
	) {}
	public async execute(
		query: GetEmployerJobsQuery,
	): Promise<{ items: EmployerJobListingResult[]; total: number }> {
		const employerProfile = await this.employerProfileRepository.findByUserId(query.userId);
		if (!employerProfile) throw new EmployerProfileNotFoundException();

		const filter: FindJobsFilter = {
			employerId: employerProfile.id,
			status: query.status,
			limit: query.limit,
			offset: query.offset,
		};

		const [jobs, total] = await Promise.all([
			this.jobListingRepository.findMany(filter),
			this.jobListingRepository.count(filter),
		]);

		const items: EmployerJobListingResult[] = jobs.map((job) => ({
			id: job.id.getValue(),
			employerId: job.employerId.getValue(),
			title: job.title,
			description: job.description,
			requirements: job.requirements,
			employmentType: job.employmentType,
			locationType: job.location.type,
			locationAddress: job.location.address,
			salaryMin: job.salaryRange?.min ?? null,
			salaryMax: job.salaryRange?.max ?? null,
			salaryCurrency: job.salaryRange?.currency ?? "USD",
			status: job.status,
			createdAt: job.createdAt,
			expiresAt: job.expiresAt,
		}));

		return { items, total };
	}
}
