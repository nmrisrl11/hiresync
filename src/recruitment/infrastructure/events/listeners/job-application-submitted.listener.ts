import {
	EnqueueApplicationSubmittedCommand,
	EnqueueApplicationSubmittedUseCasePort,
} from "@/recruitment/application/ports/inbound/notifications";
import { JobApplicationSubmittedDomainEvent } from "@/recruitment/domain/events/applications";
import { EVENT_NAMES } from "@/shared/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class JobApplicationSubmittedListener {
	constructor(
		private readonly enqueueApplicationSubmittedUseCase: EnqueueApplicationSubmittedUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(EVENT_NAMES.JOB_APPLICATION_SUBMITTED, { async: true, promisify: true })
	public async handle(event: JobApplicationSubmittedDomainEvent): Promise<void> {
		try {
			const command = new EnqueueApplicationSubmittedCommand(
				event.applicationId,
				event.applicantId,
				event.jobListingId,
				event.employerId,
			);

			await this.enqueueApplicationSubmittedUseCase.execute(command);
		} catch (error) {
			this.logger.error(
				`Failed to enqueue for submitted application: ${event.applicationId}`,
				error instanceof Error ? error.stack : "Unknown error",
			);
		}
	}
}
