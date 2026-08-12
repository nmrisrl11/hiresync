import {
	EnqueuePasswordResetEmailCommand,
	EnqueuePasswordResetEmailUseCasePort,
} from "@/iam/application/ports/inbound/authentication/notifications";
import { PasswordResetRequestedDomainEvent } from "@/iam/domain/events/authentication";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class PasswordResetRequestedListener {
	constructor(
		private readonly enqueuePasswordResetEmailUseCase: EnqueuePasswordResetEmailUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(PasswordResetRequestedDomainEvent.name, { async: true })
	public async handlePasswordResetRequested(
		event: PasswordResetRequestedDomainEvent,
	): Promise<void> {
		try {
			const command = new EnqueuePasswordResetEmailCommand(
				event.email,
				event.resetToken,
				event.tokenExpiresInMs,
			);
			await this.enqueuePasswordResetEmailUseCase.execute(command);
		} catch {
			this.logger.error(`Failed to enqueue password reset email for ${event.email}`);
		}
	}
}
