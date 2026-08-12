import {
	EnqueueMfaDisabledAlertEmailCommand,
	EnqueueMfaDisabledAlertEmailUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { UserMfaDisabledDomainEvent } from "@/iam/domain/events/account/mfa";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class UserMfaDisabledListener {
	constructor(
		private readonly enqueueMfaDisabledAlertUseCase: EnqueueMfaDisabledAlertEmailUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(UserMfaDisabledDomainEvent.name, { async: true })
	public async handle(event: UserMfaDisabledDomainEvent): Promise<void> {
		try {
			const command = new EnqueueMfaDisabledAlertEmailCommand(event.email);
			await this.enqueueMfaDisabledAlertUseCase.execute(command);
		} catch (error) {
			this.logger.error(
				`Failed to enqueue MFA disabled alert email for ${event.email}`,
				error instanceof Error ? error.stack : "Unknown error",
			);
		}
	}
}
