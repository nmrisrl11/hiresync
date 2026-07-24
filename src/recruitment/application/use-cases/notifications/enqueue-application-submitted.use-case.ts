import {
	ApplicantProfileRepository,
	EmployerProfileRepository,
	JobListingRepository,
} from "@/recruitment/domain/repositories";
import { ApplicantId, EmployerId, JobListingId } from "@/recruitment/domain/value-objects";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import {
	EnqueueApplicationSubmittedCommand,
	EnqueueApplicationSubmittedUseCasePort,
} from "../../ports/inbound/notifications";
import { RecruitmentEmailQueuePort, UserIntegrationPort } from "../../ports/outbound";

@Injectable()
export class EnqueueApplicationSubmittedUseCase implements EnqueueApplicationSubmittedUseCasePort {
	constructor(
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly jobListingRepository: JobListingRepository,
		private readonly userIntegrationPort: UserIntegrationPort,
		private readonly emailQueue: RecruitmentEmailQueuePort,
		private readonly logger: LoggerPort,
	) {}

	public async execute(command: EnqueueApplicationSubmittedCommand): Promise<void> {
		const [applicant, employer, jobListing] = await Promise.all([
			this.applicantProfileRepository.findById(new ApplicantId(command.applicantId)),
			this.employerProfileRepository.findById(new EmployerId(command.employerId)),
			this.jobListingRepository.findById(new JobListingId(command.jobListingId)),
		]);

		if (!applicant || !employer || !jobListing) {
			this.logger.warn(`Missing domain aggregates for application ${command.applicationId}`);
			return;
		}

		const applicantName = `${applicant.firstName} ${applicant.lastName}`;

		const [applicantEmail, employerEmail] = await Promise.all([
			this.userIntegrationPort.getUserEmail(applicant.userId),
			this.userIntegrationPort.getUserEmail(employer.userId),
		]);

		//! Enqueue Applicant Notification
		if (applicantEmail) {
			await this.emailQueue.enqueueApplicationSubmittedEmail(
				applicantEmail,
				applicantName,
				jobListing.title,
				employer.companyName,
			);
		}

		//! Enqueue Employer Notification
		if (employerEmail) {
			await this.emailQueue.enqueueApplicationReceivedEmail(
				employerEmail,
				employer.companyName,
				applicantName,
				jobListing.title,
			);
		}
	}
}
