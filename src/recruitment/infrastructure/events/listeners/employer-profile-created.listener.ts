import {
	EnqueueEmployerWelcomeEmailCommand,
	EnqueueEmployerWelcomeEmailUseCasePort,
} from "@/recruitment/application/ports/inbound/notifications";
import { EmployerProfileCreatedDomainEvent } from "@/recruitment/domain/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class EmployerProfileCreatedListener {
	constructor(
		private readonly enqueueWelcomeEmailUseCase: EnqueueEmployerWelcomeEmailUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(EmployerProfileCreatedDomainEvent.name, { async: true })
	public async handle(event: EmployerProfileCreatedDomainEvent): Promise<void> {
		try {
			const command = new EnqueueEmployerWelcomeEmailCommand(event.employerId, event.companyName);
			await this.enqueueWelcomeEmailUseCase.execute(command);
		} catch {
			this.logger.error(`Failed to enqueue welcome email for employer: ${event.companyName}`);
		}
	}
}
