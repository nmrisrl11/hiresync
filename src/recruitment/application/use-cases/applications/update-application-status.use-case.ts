import {
	EmployerProfileRepository,
	JobApplicationRepository,
} from "@/recruitment/domain/repositories";
import { JobApplicationId } from "@/recruitment/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import {
	EmployerProfileNotFoundException,
	JobApplicationNotFoundException,
	UnauthorizedApplicationAccessException,
} from "../../exceptions";
import {
	UpdateApplicationStatusCommand,
	UpdateApplicationStatusUseCasePort,
} from "../../ports/inbound/applications";

@Injectable()
export class UpdateApplicationStatusUseCase implements UpdateApplicationStatusUseCasePort {
	constructor(
		private readonly jobApplicationRepository: JobApplicationRepository,
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: UpdateApplicationStatusCommand): Promise<void> {
		const application = await this.jobApplicationRepository.findById(
			new JobApplicationId(command.applicationId),
		);
		if (!application) throw new JobApplicationNotFoundException();

		//! Check if the employer has access to update this application
		const employerProfile = await this.employerProfileRepository.findByUserId(command.employerId);
		if (!employerProfile) throw new EmployerProfileNotFoundException();

		if (!application.employerId.equals(employerProfile.id))
			throw new UnauthorizedApplicationAccessException();

		application.updateStatus(command.newStatus);

		await this.jobApplicationRepository.save(application);

		await this.domainEventPublisher.publishMultipleAsync(application.domainEvents);
		application.clearEvents();
	}
}
