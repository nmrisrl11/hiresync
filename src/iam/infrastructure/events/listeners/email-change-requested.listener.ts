import {
	EnqueueChangeEmailRequestCommand,
	EnqueueChangeEmailRequestUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { EmailChangeRequestedDomainEvent } from "@/iam/domain/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class EmailChangeRequestedListener {
	constructor(
		private readonly enqueueChangeEmailRequestUseCase: EnqueueChangeEmailRequestUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent("EmailChangeRequestedDomainEvent", { async: true })
	public async handleEmailChangeRequested(event: EmailChangeRequestedDomainEvent): Promise<void> {
		try {
			const command = new EnqueueChangeEmailRequestCommand(
				event.email,
				event.changeToken,
				event.tokenExpiresInMs,
			);
			await this.enqueueChangeEmailRequestUseCase.execute(command);
		} catch {
			this.logger.error(`Failed to enqueue email change request for ${event.email}`);
		}
	}
}
