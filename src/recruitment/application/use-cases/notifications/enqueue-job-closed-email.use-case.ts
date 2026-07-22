import { Injectable } from "@nestjs/common";
import {
	EnqueueJobClosedEmailCommand,
	EnqueueJobClosedEmailUseCasePort,
} from "../../ports/inbound/notifications";
import { EmployerProfileRepository, JobListingRepository } from "@/recruitment/domain/repositories";
import { RecruitmentEmailQueuePort, UserIntegrationPort } from "../../ports/outbound";
import { EmployerId, JobListingId } from "@/recruitment/domain/value-objects";

@Injectable()
export class EnqueueJobClosedEmailUseCase implements EnqueueJobClosedEmailUseCasePort {
	constructor(
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly jobListingRepository: JobListingRepository,
		private readonly userIntegrationPort: UserIntegrationPort,
		private readonly emailQueue: RecruitmentEmailQueuePort,
	) {}
	public async execute(command: EnqueueJobClosedEmailCommand): Promise<void> {
		const profile = await this.employerProfileRepository.findById(
			new EmployerId(command.employerId),
		);
		if (!profile) return;

		const jobListing = await this.jobListingRepository.findById(
			new JobListingId(command.jobListingId),
		);
		if (!jobListing) return;

		const email = await this.userIntegrationPort.getUserEmail(profile.userId);
		if (!email) return;

		await this.emailQueue.enqueueJobClosedEmail(
			email,
			profile.companyName,
			jobListing.title,
			command.reason,
		);
	}
}
