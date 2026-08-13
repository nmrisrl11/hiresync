import {
	EnqueueVerificationEmailCommand,
	EnqueueVerificationEmailUseCasePort,
} from "@/iam/application/ports/inbound/authentication/notifications";
import { UserRegisteredDomainEvent } from "@/iam/domain/events/authentication";
import { EVENT_NAMES } from "@/shared/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class UserRegisteredListener {
	constructor(
		private readonly enqueueVerificationEmailUseCase: EnqueueVerificationEmailUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(EVENT_NAMES.USER_REGISTERED, { async: true })
	public async handle(event: UserRegisteredDomainEvent): Promise<void> {
		try {
			const command = new EnqueueVerificationEmailCommand(
				event.email,
				event.verificationToken,
				event.tokenExpiresInMs,
			);

			await this.enqueueVerificationEmailUseCase.execute(command);
		} catch {
			this.logger.error(`Unable to queue verification email for ${event.email}`);
		}
	}
}
