import {
	EnqueueApplicationStatusUpdatedCommand,
	EnqueueApplicationStatusUpdatedUseCasePort,
} from "@/recruitment/application/ports/inbound/notifications";
import { JobApplicationStatusUpdatedDomainEvent } from "@/recruitment/domain/events/applications";
import { EVENT_NAMES } from "@/shared/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class JobApplicationStatusUpdatedListener {
	constructor(
		private readonly enqueueApplicationStatusUpdatedUseCase: EnqueueApplicationStatusUpdatedUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(EVENT_NAMES.JOB_APPLICATION_STATUS_UPDATED, { async: true, promisify: true })
	public async handle(event: JobApplicationStatusUpdatedDomainEvent): Promise<void> {
		try {
			const command = new EnqueueApplicationStatusUpdatedCommand(
				event.applicationId,
				event.applicantId,
				event.newStatus,
			);

			await this.enqueueApplicationStatusUpdatedUseCase.execute(command);
		} catch (error) {
			this.logger.error(
				`Failed to enqueue for updated application status: ${event.applicationId}`,
				error instanceof Error ? error.stack : "Unknown error",
			);
		}
	}
}
