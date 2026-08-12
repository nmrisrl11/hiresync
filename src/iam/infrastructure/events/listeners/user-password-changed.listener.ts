import {
	EnqueuePasswordChangedAlertCommand,
	EnqueuePasswordChangedAlertUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { UserPasswordChangedDomainEvent } from "@/iam/domain/events/account";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class UserPasswordChangedListener {
	constructor(
		private readonly enqueuePasswordChangedAlertUseCase: EnqueuePasswordChangedAlertUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(UserPasswordChangedDomainEvent.name, { async: true })
	public async handlePasswordChanged(event: UserPasswordChangedDomainEvent): Promise<void> {
		try {
			const command = new EnqueuePasswordChangedAlertCommand(event.email);
			await this.enqueuePasswordChangedAlertUseCase.execute(command);
		} catch {
			this.logger.error(`Failed to enqueue password changed alert for ${event.email}`);
		}
	}
}
