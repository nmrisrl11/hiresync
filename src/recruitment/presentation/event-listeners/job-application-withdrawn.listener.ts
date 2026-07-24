import {
	EnqueueApplicationWithdrawnCommand,
	EnqueueApplicationWithdrawnUseCasePort,
} from "@/recruitment/application/ports/inbound/notifications";
import { JobApplicationWithdrawnDomainEvent } from "@/recruitment/domain/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class JobApplicationWithdrawnListener {
	constructor(
		private readonly enqueueApplicationWithdrawnUseCase: EnqueueApplicationWithdrawnUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(JobApplicationWithdrawnDomainEvent.name, { async: true, promisify: true })
	public async handle(event: JobApplicationWithdrawnDomainEvent): Promise<void> {
		try {
			const command = new EnqueueApplicationWithdrawnCommand(
				event.applicationId,
				event.applicantId,
				event.jobListingId,
				event.employerId,
			);

			await this.enqueueApplicationWithdrawnUseCase.execute(command);
		} catch (error) {
			this.logger.error(
				`Failed to enqueue for withdrawn application: ${event.applicationId}`,
				error instanceof Error ? error.stack : "Unknown error",
			);
		}
	}
}
