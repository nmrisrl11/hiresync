import { JobListing } from "@/recruitment/domain/entities";
import {
	EmployerProfileRepository,
	FindJobsFilter,
	JobListingRepository,
} from "@/recruitment/domain/repositories";
import { Injectable } from "@nestjs/common";
import { EmployerProfileNotFoundException } from "../../exceptions";
import { GetEmployerJobsQuery, GetEmployerJobsUseCasePort } from "../../ports/inbound/jobs";

@Injectable()
export class GetEmployerJobsUseCase implements GetEmployerJobsUseCasePort {
	constructor(
		private readonly jobListingRepository: JobListingRepository,
		private readonly employerProfileRepository: EmployerProfileRepository,
	) {}
	public async execute(
		query: GetEmployerJobsQuery,
	): Promise<{ items: JobListing[]; total: number }> {
		const employerProfile = await this.employerProfileRepository.findByUserId(query.userId);
		if (!employerProfile) throw new EmployerProfileNotFoundException();

		const filter: FindJobsFilter = {
			employerId: employerProfile.id,
			status: query.status,
			limit: query.limit,
			offset: query.offset,
		};

		const [items, total] = await Promise.all([
			this.jobListingRepository.findMany(filter),
			this.jobListingRepository.count(filter),
		]);

		return { items, total };
	}
}
