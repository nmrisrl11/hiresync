import {
	EnqueueChangeEmailRequestCommand,
	EnqueueChangeEmailRequestUseCasePort,
} from "@/iam/application/ports/inbound/account";
import {
	EnqueuePasswordResetEmailCommand,
	EnqueuePasswordResetEmailUseCasePort,
	EnqueueVerificationEmailCommand,
	EnqueueVerificationEmailUseCasePort,
} from "@/iam/application/ports/inbound/authentication";
import {
	EmailChangeRequestedDomainEvent,
	PasswordResetRequestedDomainEvent,
	VerificationEmailResentDomainEvent,
} from "@/iam/domain/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class CommunicationListener {
	constructor(
		private readonly enqueueVerificationEmailUseCase: EnqueueVerificationEmailUseCasePort,
		private readonly enqueuePasswordResetEmailUseCase: EnqueuePasswordResetEmailUseCasePort,
		private readonly enqueueChangeEmailRequestUseCase: EnqueueChangeEmailRequestUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent("VerificationEmailResentDomainEvent", { async: true })
	public async handleVerificationResent(event: VerificationEmailResentDomainEvent): Promise<void> {
		try {
			const command = new EnqueueVerificationEmailCommand(
				event.email,
				event.verificationToken,
				event.tokenExpiresInMs,
			);
			await this.enqueueVerificationEmailUseCase.execute(command);
		} catch {
			this.logger.error(`Failed to enqueue resent verification email for ${event.email}`);
		}
	}

	@OnEvent("PasswordResetRequestedDomainEvent", { async: true })
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
