import { EmployerProfileRepository, JobListingRepository } from "@/recruitment/domain/repositories";
import { JobListingId } from "@/recruitment/domain/value-objects";
import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import {
	EmployerProfileNotFoundException,
	JobListingNotFoundException,
	UnauthorizedJobListingException,
} from "../../exceptions";
import { CloseJobListingCommand, CloseJobListingUseCasePort } from "../../ports/inbound/jobs";

@Injectable()
export class CloseJobListingUseCase implements CloseJobListingUseCasePort {
	constructor(
		private readonly jobListingRepository: JobListingRepository,
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly eventDispatcher: DomainEventDispatcherPort,
	) {}

	public async execute(command: CloseJobListingCommand): Promise<void> {
		const employerProfile = await this.employerProfileRepository.findByUserId(command.userId);
		if (!employerProfile) throw new EmployerProfileNotFoundException();

		const jobListingIdVo = new JobListingId(command.jobListingId);
		const jobListing = await this.jobListingRepository.findById(jobListingIdVo);
		if (!jobListing) throw new JobListingNotFoundException();

		if (!jobListing.employerId.equals(employerProfile.id))
			throw new UnauthorizedJobListingException();

		jobListing.close(command.reason);

		await this.jobListingRepository.save(jobListing);

		await this.eventDispatcher.dispatchMultiple(jobListing.domainEvents);
		jobListing.clearEvents();
	}
}
