import {
	EnqueueWelcomeEmailCommand,
	EnqueueWelcomeEmailUseCasePort,
} from "@/iam/application/ports/inbound/authentication/notifications";
import { UserEmailVerifiedDomainEvent } from "@/iam/domain/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class UserEmailVerifiedListener {
	constructor(
		private readonly enqueueWelcomeEmailUseCase: EnqueueWelcomeEmailUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(UserEmailVerifiedDomainEvent.name, { async: true })
	public async handleUserVerified(event: UserEmailVerifiedDomainEvent): Promise<void> {
		try {
			const command = new EnqueueWelcomeEmailCommand(event.email);
			await this.enqueueWelcomeEmailUseCase.execute(command);
		} catch {
			this.logger.error(`Failed to enqueue welcome email for ${event.email}`);
		}
	}
}
