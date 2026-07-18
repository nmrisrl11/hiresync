import {
	EnqueueVerificationEmailCommand,
	EnqueueVerificationEmailUseCasePort,
} from "@/iam/application/ports/inbound/authentication/notifications";
import { VerificationEmailResentDomainEvent } from "@/iam/domain/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class VerificationEmailResentListener {
	constructor(
		private readonly enqueueVerificationEmailUseCase: EnqueueVerificationEmailUseCasePort,
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
}
