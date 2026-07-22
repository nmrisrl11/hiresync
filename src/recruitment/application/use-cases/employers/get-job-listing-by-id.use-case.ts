import { Injectable } from "@nestjs/common";
import {
	GetJobListingByIdQuery,
	GetJobListingByIdUseCasePort,
	PublicJobListingResult,
} from "../../ports/inbound/employers";
import { EmployerProfileRepository, JobListingRepository } from "@/recruitment/domain/repositories";
import { EmployerProfileNotFoundException, JobListingNotFoundException } from "../../exceptions";
import { EmployerId, JobListingId } from "@/recruitment/domain/value-objects";

@Injectable()
export class GetJobListingByIdUseCase implements GetJobListingByIdUseCasePort {
	constructor(
		private readonly jobListingRepository: JobListingRepository,
		private readonly employerProfileRepository: EmployerProfileRepository,
	) {}

	public async execute(query: GetJobListingByIdQuery): Promise<PublicJobListingResult> {
		const jobListingIdVo = new JobListingId(query.jobId);

		const jobListing = await this.jobListingRepository.findById(jobListingIdVo);
		if (!jobListing) throw new JobListingNotFoundException();

		const employerIdVo = new EmployerId(jobListing.employerId.getValue());
		const employerProfile = await this.employerProfileRepository.findById(employerIdVo);
		if (!employerProfile) throw new EmployerProfileNotFoundException();

		return {
			id: jobListing.id.getValue(),
			employerId: jobListing.employerId.getValue(),
			companyName: employerProfile.companyName,
			companyLogoUrl: employerProfile.logoUrl,
			title: jobListing.title,
			description: jobListing.description,
			requirements: jobListing.requirements,
			employmentType: jobListing.employmentType,
			locationType: jobListing.location.type,
			locationAddress: jobListing.location.address,
			salaryMin: jobListing.salaryRange?.min ?? null,
			salaryMax: jobListing.salaryRange?.max ?? null,
			salaryCurrency: jobListing.salaryRange?.currency ?? "USD",
			status: jobListing.status,
			postedAt: jobListing.createdAt,
		};
	}
}
