import {
	EnqueueMfaEnabledAlertEmailCommand,
	EnqueueMfaEnabledAlertEmailUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { UserMfaEnabledDomainEvent } from "@/iam/domain/events/account/mfa";
import { EVENT_NAMES } from "@/shared/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class UserMfaEnabledListener {
	constructor(
		private readonly enqueueMfaEnabledAlertUseCase: EnqueueMfaEnabledAlertEmailUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(EVENT_NAMES.USER_MFA_ENABLED, { async: true })
	public async handle(event: UserMfaEnabledDomainEvent): Promise<void> {
		try {
			const command = new EnqueueMfaEnabledAlertEmailCommand(event.email);
			await this.enqueueMfaEnabledAlertUseCase.execute(command);
		} catch (error) {
			this.logger.error(
				`Failed to enqueue MFA enabled alert email for ${event.email}`,
				error instanceof Error ? error.stack : "Unknown error",
			);
		}
	}
}
