import {
	ApplicantProfileRepository,
	JobApplicationRepository,
} from "@/recruitment/domain/repositories";
import { JobApplicationId } from "@/recruitment/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/application/ports/outbound";
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

@Injectable()
export class WithdrawApplicationUseCase implements WithdrawApplicationUseCasePort {
	constructor(
		private readonly jobApplicationRepository: JobApplicationRepository,
		private readonly applicantProfileRepository: ApplicantProfileRepository,
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

		await this.jobApplicationRepository.save(application);

		await this.domainEventPublisher.publishMultipleAsync(application.domainEvents);
		application.clearEvents();
	}
}
