import { Injectable } from "@nestjs/common";
import { EditJobListingCommand, EditJobListingUseCasePort } from "../../ports/inbound/employers";
import { EmployerProfileRepository, JobListingRepository } from "@/recruitment/domain/repositories";
import {
	EmployerProfileNotFoundException,
	JobListingNotFoundException,
	UnauthorizedJobListingException,
} from "../../exceptions";
import { JobListingId, JobLocation, SalaryRange } from "@/recruitment/domain/value-objects";
import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";

@Injectable()
export class EditJobListingUseCase implements EditJobListingUseCasePort {
	constructor(
		private readonly jobListingRepository: JobListingRepository,
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly eventDispatcher: DomainEventDispatcherPort,
	) {}

	public async execute(command: EditJobListingCommand): Promise<void> {
		const employerProfile = await this.employerProfileRepository.findByUserId(command.userId);

		if (!employerProfile) throw new EmployerProfileNotFoundException("Employer profile not found.");

		const jobListingIdVo = new JobListingId(command.jobListingId);
		const jobListing = await this.jobListingRepository.findById(jobListingIdVo);

		if (!jobListing) throw new JobListingNotFoundException();

		if (!jobListing.employerId.equals(employerProfile.id))
			throw new UnauthorizedJobListingException();

		const locationVo = new JobLocation(command.locationType, command.locationAddress);

		let salaryVo: SalaryRange | null = null;
		if (command.salaryMin !== null && command.salaryMax !== null) {
			salaryVo = new SalaryRange(command.salaryMin, command.salaryMax, command.salaryCurrency);
		}

		jobListing.update(
			command.title,
			command.description,
			command.requirements,
			command.employmentType,
			locationVo,
			salaryVo,
		);

		await this.jobListingRepository.save(jobListing);

		await this.eventDispatcher.dispatchMultiple(jobListing.domainEvents);
		jobListing.clearEvents();
	}
}
