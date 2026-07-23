import { EmployerProfileRepository, JobListingRepository } from "@/recruitment/domain/repositories";
import { JOB_STATUS } from "@/recruitment/domain/types";
import { EmployerId } from "@/recruitment/domain/value-objects";
import { Injectable } from "@nestjs/common";
import {
	PublicJobListingResult,
	SearchJobListingQuery,
	SearchJobListingUseCasePort,
} from "../../ports/inbound/jobs";

@Injectable()
export class SearchJobListingUseCase implements SearchJobListingUseCasePort {
	constructor(
		private readonly jobListingRepository: JobListingRepository,
		private readonly employerProfileRepository: EmployerProfileRepository,
	) {}

	public async execute(
		query: SearchJobListingQuery,
	): Promise<{ items: PublicJobListingResult[]; total: number }> {
		const filter = {
			limit: query.limit,
			offset: query.offset,
			status: JOB_STATUS.PUBLISHED,
			searchQuery: query.searchQuery,
			employmentType: query.employmentType,
			locationType: query.locationType,
		};

		const [jobs, total] = await Promise.all([
			this.jobListingRepository.findMany(filter),
			this.jobListingRepository.count(filter),
		]);

		//! Extract unique employer IDs to batch fetch profiles
		const uniqueEmployerIds = [...new Set(jobs.map((j) => j.employerId.getValue()))];

		const profiles = await Promise.all(
			uniqueEmployerIds.map((id) => this.employerProfileRepository.findById(new EmployerId(id))),
		);

		//! Create a lookup map for instant access
		const profileMap = new Map(profiles.map((p) => [p?.id.getValue(), p]));

		const items: PublicJobListingResult[] = jobs.map((job) => {
			const employerProfile = profileMap.get(job.employerId.getValue());

			return {
				id: job.id.getValue(),
				employerId: job.employerId.getValue(),
				companyName: employerProfile?.companyName ?? "Unknown Company",
				companyLogoUrl: employerProfile?.logoUrl ?? null,
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
				postedAt: job.createdAt,
			};
		});

		return { items, total };
	}
}
