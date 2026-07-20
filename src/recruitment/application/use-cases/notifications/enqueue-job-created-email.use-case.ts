import { EmployerProfileRepository } from "@/recruitment/domain/repositories";
import { EmployerId } from "@/recruitment/domain/value-objects";
import { Injectable } from "@nestjs/common";
import {
	EnqueueJobCreatedEmailCommand,
	EnqueueJobCreatedEmailUseCasePort,
} from "../../ports/inbound/notifications/enqueue-job-created-email.in-port";
import { RecruitmentEmailQueuePort, UserIntegrationPort } from "../../ports/outbound";

@Injectable()
export class EnqueueJobCreatedEmailUseCase implements EnqueueJobCreatedEmailUseCasePort {
	constructor(
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly userIntegrationPort: UserIntegrationPort,
		private readonly emailQueue: RecruitmentEmailQueuePort,
	) {}

	public async execute(command: EnqueueJobCreatedEmailCommand): Promise<void> {
		const profile = await this.employerProfileRepository.findById(
			new EmployerId(command.employerId),
		);
		if (!profile) return;

		const email = await this.userIntegrationPort.getUserEmail(profile.userId);
		if (!email) return;

		await this.emailQueue.enqueueJobCreatedEmail(email, profile.companyName, command.jobTitle);
	}
}
