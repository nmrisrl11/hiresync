import {
	ApplicantProfileRepository,
	JobApplicationRepository,
} from "@/recruitment/domain/repositories";
import { JobApplicationHistoryId, JobApplicationId } from "@/recruitment/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { Injectable } from "@nestjs/common";
import {
	ApplicantProfileNotFoundException,
	JobApplicationNotFoundException,
	UnauthorizedApplicationAccessException,
} from "../../exceptions";
import {
	WithdrawApplicationCommand,
	WithdrawApplicationUseCasePort,
} from "../../ports/inbound/applications";
import { IdGeneratorPort } from "@/shared/utils/ports";
import { JobApplicationHistory } from "@/recruitment/domain/entities";
import { APPLICATION_EVENT_TYPE } from "@/recruitment/domain/types";

@Injectable()
export class WithdrawApplicationUseCase implements WithdrawApplicationUseCasePort {
	constructor(
		private readonly jobApplicationRepository: JobApplicationRepository,
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly idGenerator: IdGeneratorPort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: WithdrawApplicationCommand): Promise<void> {
		const applicant = await this.applicantProfileRepository.findByUserId(command.userId);
		if (!applicant) throw new ApplicantProfileNotFoundException();

		const application = await this.jobApplicationRepository.findById(
			new JobApplicationId(command.applicationId),
		);
		if (!application) throw new JobApplicationNotFoundException();

		if (!application.applicantId.equals(applicant.id))
			throw new UnauthorizedApplicationAccessException(
				"You can only withdraw your own applications.",
			);

		application.withdraw();

		//! Create and push history event
		const historyRecord = new JobApplicationHistory(
			new JobApplicationHistoryId(this.idGenerator.generateId()),
			application.id,
			APPLICATION_EVENT_TYPE.WITHDRAWN,
			"The applicant has withdrawn this application.",
			null,
			true, //! Publicly visible to both Employer and Applicant
			new Date(),
		);
		application.addHistory(historyRecord);

		await this.jobApplicationRepository.save(application);

		await this.domainEventPublisher.publishMultipleAsync(application.domainEvents);
		application.clearEvents();
	}
}
