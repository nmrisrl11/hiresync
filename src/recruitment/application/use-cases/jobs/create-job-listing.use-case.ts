import { Injectable } from "@nestjs/common";
import { JobListing } from "@/recruitment/domain/entities";
import { EmployerProfileRepository, JobListingRepository } from "@/recruitment/domain/repositories";
import { JobListingId, JobLocation, SalaryRange } from "@/recruitment/domain/value-objects";
import { DomainEventDispatcherPort, IdGeneratorPort } from "@/shared/application/ports/outbound";
import { EmployerProfileNotFoundException } from "../../exceptions";
import { CreateJobListingCommand, CreateJobListingUseCasePort } from "../../ports/inbound/jobs";

@Injectable()
export class CreateJobListingUseCase implements CreateJobListingUseCasePort {
	constructor(
		private readonly jobListingRepository: JobListingRepository,
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly idGenerator: IdGeneratorPort,
		private readonly eventDispatcher: DomainEventDispatcherPort,
	) {}

	public async execute(command: CreateJobListingCommand): Promise<string> {
		const employerProfile = await this.employerProfileRepository.findByUserId(command.userId);
		if (!employerProfile)
			throw new EmployerProfileNotFoundException(
				"You must create an employer profile before posting a job.",
			);

		const jobListingId = new JobListingId(this.idGenerator.generateId());
		const locationVo = new JobLocation(command.locationType, command.locationAddress);

		let salaryVo: SalaryRange | null = null;
		if (command.salaryMin !== null && command.salaryMax !== null) {
			salaryVo = new SalaryRange(command.salaryMin, command.salaryMax, command.salaryCurrency);
		}

		const jobListing = JobListing.create(
			jobListingId,
			employerProfile.id,
			command.title,
			command.description,
			command.requirements,
			command.employmentType,
			locationVo,
			salaryVo,
			command.expiresAt,
		);

		await this.jobListingRepository.save(jobListing);

		await this.eventDispatcher.dispatchMultiple(jobListing.domainEvents);
		jobListing.clearEvents();

		return jobListing.id.getValue();
	}
}
