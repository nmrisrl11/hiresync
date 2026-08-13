import {
	EnqueueEmailChangedAlertCommand,
	EnqueueEmailChangedAlertUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { UserEmailChangedDomainEvent } from "@/iam/domain/events/account";
import { EVENT_NAMES } from "@/shared/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class UserEmailChangedListener {
	constructor(
		private readonly enqueueEmailChangedAlertUseCase: EnqueueEmailChangedAlertUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(EVENT_NAMES.USER_EMAIL_CHANGED, { async: true })
	public async handleEmailChanged(event: UserEmailChangedDomainEvent): Promise<void> {
		try {
			const command = new EnqueueEmailChangedAlertCommand(event.oldEmail, event.newEmail);
			await this.enqueueEmailChangedAlertUseCase.execute(command);
		} catch {
			this.logger.error(`Failed to enqueue email changed alert for ${event.oldEmail}`);
		}
	}
}
