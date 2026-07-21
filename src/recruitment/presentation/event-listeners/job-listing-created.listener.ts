import {
	EnqueueJobCreatedEmailCommand,
	EnqueueJobCreatedEmailUseCasePort,
} from "@/recruitment/application/ports/inbound/notifications/enqueue-job-created-email.in-port";
import { JobListingCreatedDomainEvent } from "@/recruitment/domain/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class JobListingCreatedListener {
	constructor(
		private readonly enqueueJobCreatedEmailUseCase: EnqueueJobCreatedEmailUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent("JobListingCreatedDomainEvent", { async: true })
	public async handle(event: JobListingCreatedDomainEvent): Promise<void> {
		try {
			const command = new EnqueueJobCreatedEmailCommand(event.employerId, event.title);
			await this.enqueueJobCreatedEmailUseCase.execute(command);
		} catch {
			this.logger.error(`Failed to enqueue job created email for job: ${event.title}`);
		}
	}
}
