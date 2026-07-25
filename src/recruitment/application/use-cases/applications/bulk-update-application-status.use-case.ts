import { JobApplication } from "@/recruitment/domain/entities";
import {
	EmployerProfileRepository,
	JobApplicationRepository,
} from "@/recruitment/domain/repositories";
import { JobApplicationId } from "@/recruitment/domain/value-objects";
import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
import { DomainEvent } from "@/shared/domain/events/domain-event.base";
import { Injectable } from "@nestjs/common";
import {
	EmployerProfileNotFoundException,
	UnauthorizedApplicationAccessException,
} from "../../exceptions";
import {
	BulkUpdateApplicationStatusCommand,
	BulkUpdateApplicationStatusUseCasePort,
} from "../../ports/inbound/applications";

@Injectable()
export class BulkUpdateApplicationStatusUseCase implements BulkUpdateApplicationStatusUseCasePort {
	constructor(
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly jobApplicationRepository: JobApplicationRepository,
		private readonly eventDispatcher: DomainEventDispatcherPort,
	) {}

	public async execute(command: BulkUpdateApplicationStatusCommand): Promise<void> {
		const employer = await this.employerProfileRepository.findByUserId(command.employerUserId);
		if (!employer) throw new EmployerProfileNotFoundException();

		const applicationIds = command.applicationIds.map((id) => new JobApplicationId(id));
		const applications = await this.jobApplicationRepository.findByIds(applicationIds);

		if (applications.length === 0) return;

		//! Enforce ownership and update status via the aggregate root to queue domain events
		const updatedApplications: JobApplication[] = [];
		const allEvents: DomainEvent[] = [];

		for (const application of applications) {
			if (!application.employerId.equals(employer.id))
				throw new UnauthorizedApplicationAccessException(
					`Application ${application.id.getValue()} does not belong to your job listings.`,
				);

			application.updateStatus(command.newStatus);

			updatedApplications.push(application);
			allEvents.push(...application.domainEvents);
			application.clearEvents();
		}

		await this.jobApplicationRepository.saveMany(updatedApplications);

		if (allEvents.length > 0) await this.eventDispatcher.dispatchMultiple(allEvents);
	}
}
