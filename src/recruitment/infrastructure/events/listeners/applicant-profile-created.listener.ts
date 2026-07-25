import {
	EnqueueApplicantWelcomeEmailCommand,
	EnqueueApplicantWelcomeEmailUseCasePort,
} from "@/recruitment/application/ports/inbound/notifications";
import { ApplicantProfileCreatedDomainEvent } from "@/recruitment/domain/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class ApplicantProfileCreatedListener {
	constructor(
		private readonly enqueueApplicantWelcomeEmailUseCase: EnqueueApplicantWelcomeEmailUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(ApplicantProfileCreatedDomainEvent.name, { async: true, promisify: true })
	public async handle(event: ApplicantProfileCreatedDomainEvent): Promise<void> {
		try {
			const command = new EnqueueApplicantWelcomeEmailCommand(
				event.applicantId,
				event.firstName,
				event.lastName,
			);
			await this.enqueueApplicantWelcomeEmailUseCase.execute(command);
		} catch (error) {
			this.logger.error(
				`Failed to enqueue welcome email for applicant: ${event.applicantId}`,
				error instanceof Error ? error.stack : "Unknown error",
			);
		}
	}
}
