import {
	ApplicantProfileRepository,
	EmployerProfileRepository,
	JobListingRepository,
} from "@/recruitment/domain/repositories";
import { ApplicantId, EmployerId, JobListingId } from "@/recruitment/domain/value-objects";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import {
	EnqueueApplicationWithdrawnCommand,
	EnqueueApplicationWithdrawnUseCasePort,
} from "../../ports/inbound/notifications";
import { RecruitmentEmailQueuePort, UserIntegrationPort } from "../../ports/outbound";

@Injectable()
export class EnqueueApplicationWithdrawnUseCase implements EnqueueApplicationWithdrawnUseCasePort {
	constructor(
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly jobListingRepository: JobListingRepository,
		private readonly userIntegrationPort: UserIntegrationPort,
		private readonly emailQueue: RecruitmentEmailQueuePort,
		private readonly logger: LoggerPort,
	) {}

	public async execute(command: EnqueueApplicationWithdrawnCommand): Promise<void> {
		const [applicant, employer, jobListing] = await Promise.all([
			this.applicantProfileRepository.findById(new ApplicantId(command.applicantId)),
			this.employerProfileRepository.findById(new EmployerId(command.employerId)),
			this.jobListingRepository.findById(new JobListingId(command.jobListingId)),
		]);

		if (!applicant || !employer || !jobListing) {
			this.logger.warn(
				`Missing domain aggregates for withdrawn application ${command.applicationId}`,
			);
			return;
		}

		const employerEmail = await this.userIntegrationPort.getUserEmail(employer.userId);
		if (!employerEmail) return;

		await this.emailQueue.enqueueApplicationWithdrawnEmail(
			employerEmail,
			employer.companyName,
			`${applicant.firstName} ${applicant.lastName}`,
			jobListing.title,
		);
	}
}
