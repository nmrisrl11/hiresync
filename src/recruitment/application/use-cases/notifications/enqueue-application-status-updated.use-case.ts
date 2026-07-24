import {
	ApplicantProfileRepository,
	EmployerProfileRepository,
	JobApplicationRepository,
	JobListingRepository,
} from "@/recruitment/domain/repositories";
import { JobApplicationId } from "@/recruitment/domain/value-objects";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import {
	EnqueueApplicationStatusUpdatedCommand,
	EnqueueApplicationStatusUpdatedUseCasePort,
} from "../../ports/inbound/notifications";
import { RecruitmentEmailQueuePort, UserIntegrationPort } from "../../ports/outbound";

@Injectable()
export class EnqueueApplicationStatusUpdatedUseCase implements EnqueueApplicationStatusUpdatedUseCasePort {
	constructor(
		private readonly applicationRepository: JobApplicationRepository,
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly jobListingRepository: JobListingRepository,
		private readonly userIntegrationPort: UserIntegrationPort,
		private readonly emailQueue: RecruitmentEmailQueuePort,
		private readonly logger: LoggerPort,
	) {}

	public async execute(command: EnqueueApplicationStatusUpdatedCommand): Promise<void> {
		const application = await this.applicationRepository.findById(
			new JobApplicationId(command.applicationId),
		);
		if (!application) return;

		const [applicant, employer, jobListing] = await Promise.all([
			this.applicantProfileRepository.findById(application.applicantId),
			this.employerProfileRepository.findById(application.employerId),
			this.jobListingRepository.findById(application.jobListingId),
		]);

		if (!applicant || !employer || !jobListing) {
			this.logger.warn(`Missing domain aggregates for application ${command.applicationId}`);
			return;
		}

		const applicantEmail = await this.userIntegrationPort.getUserEmail(applicant.userId);
		if (!applicantEmail) return;

		await this.emailQueue.enqueueApplicationStatusUpdatedEmail(
			applicantEmail,
			`${applicant.firstName} ${applicant.lastName}`,
			jobListing.title,
			employer.companyName,
			command.newStatus,
		);
	}
}
