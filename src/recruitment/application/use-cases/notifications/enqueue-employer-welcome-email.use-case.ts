import { EmployerProfileRepository } from "@/recruitment/domain/repositories";
import { EmployerId } from "@/recruitment/domain/value-objects";
import { Injectable } from "@nestjs/common";
import {
	EnqueueEmployerWelcomeEmailCommand,
	EnqueueEmployerWelcomeEmailUseCasePort,
} from "../../ports/inbound/notifications";
import { RecruitmentEmailQueuePort, UserIntegrationPort } from "../../ports/outbound";

@Injectable()
export class EnqueueEmployerWelcomeEmailUseCase implements EnqueueEmployerWelcomeEmailUseCasePort {
	constructor(
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly userIntegrationPort: UserIntegrationPort,
		private readonly emailQueue: RecruitmentEmailQueuePort,
	) {}

	public async execute(command: EnqueueEmployerWelcomeEmailCommand): Promise<void> {
		const profile = await this.employerProfileRepository.findById(
			new EmployerId(command.employerId),
		);
		if (!profile) return;

		const email = await this.userIntegrationPort.getUserEmail(profile.userId);
		if (!email) return;

		await this.emailQueue.enqueueEmployerWelcomeEmail(email, command.companyName);
	}
}
