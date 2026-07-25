import {
	EnqueueJobClosedEmailCommand,
	EnqueueJobClosedEmailUseCasePort,
} from "@/recruitment/application/ports/inbound/notifications";
import { JobListingClosedDomainEvent } from "@/recruitment/domain/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class JobListingClosedListener {
	constructor(
		private readonly enqueueJobClosedEmailUseCase: EnqueueJobClosedEmailUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent("JobListingClosedDomainEvent", { async: true })
	public async handle(event: JobListingClosedDomainEvent): Promise<void> {
		try {
			const command = new EnqueueJobClosedEmailCommand(
				event.employerId,
				event.jobListingId,
				event.reason,
			);
			await this.enqueueJobClosedEmailUseCase.execute(command);
		} catch {
			this.logger.error(`Failed to enqueue job closed email for job ID: ${event.jobListingId}`);
		}
	}
}
