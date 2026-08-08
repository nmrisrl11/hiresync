import { JobApplicationHistory } from "@/recruitment/domain/entities";
import {
	EmployerProfileRepository,
	JobApplicationRepository,
} from "@/recruitment/domain/repositories";
import { APPLICATION_EVENT_TYPE } from "@/recruitment/domain/types";
import { JobApplicationHistoryId, JobApplicationId } from "@/recruitment/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { IdGeneratorPort } from "@/shared/utils/ports";
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
		private readonly idGenerator: IdGeneratorPort,
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

		//! Capture the previous status before updating
		const previousStatus = application.status;

		application.updateStatus(command.newStatus);

		//! Create and push history timeline event
		const historyRecord = new JobApplicationHistory(
			new JobApplicationHistoryId(this.idGenerator.generateId()),
			application.id,
			APPLICATION_EVENT_TYPE.STATUS_UPDATED,
			`Application status changed from ${previousStatus} to ${command.newStatus}.`,
			{ oldStatus: previousStatus, newStatus: command.newStatus },
			true, //! Publicly visible to Applicant
			new Date(),
		);
		application.addHistory(historyRecord);

		await this.jobApplicationRepository.save(application);

		await this.domainEventPublisher.publishMultipleAsync(application.domainEvents);
		application.clearEvents();
	}
}
