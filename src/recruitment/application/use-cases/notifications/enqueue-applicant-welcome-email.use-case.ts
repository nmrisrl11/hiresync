import { ApplicantProfileRepository } from "@/recruitment/domain/repositories";
import { ApplicantId } from "@/recruitment/domain/value-objects";
import { Injectable } from "@nestjs/common";
import {
	EnqueueApplicantWelcomeEmailCommand,
	EnqueueApplicantWelcomeEmailUseCasePort,
} from "../../ports/inbound/notifications";
import { RecruitmentEmailQueuePort, UserIntegrationPort } from "../../ports/outbound";

@Injectable()
export class EnqueueApplicantWelcomeEmailUseCase implements EnqueueApplicantWelcomeEmailUseCasePort {
	constructor(
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly userIntegrationPort: UserIntegrationPort,
		private readonly emailQueue: RecruitmentEmailQueuePort,
	) {}

	public async execute(command: EnqueueApplicantWelcomeEmailCommand): Promise<void> {
		const profile = await this.applicantProfileRepository.findById(
			new ApplicantId(command.applicantId),
		);
		if (!profile) return;

		const email = await this.userIntegrationPort.getUserEmail(profile.userId);
		if (!email) return;

		await this.emailQueue.enqueueApplicantWelcomeEmail(email, profile.firstName, profile.lastName);
	}
}
