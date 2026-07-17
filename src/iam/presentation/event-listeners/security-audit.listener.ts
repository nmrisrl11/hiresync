import {
	EnqueueEmailChangedAlertCommand,
	EnqueueEmailChangedAlertUseCasePort,
	EnqueuePasswordChangedAlertCommand,
	EnqueuePasswordChangedAlertUseCasePort,
} from "@/iam/application/ports/inbound/account";
import { UserEmailChangedDomainEvent, UserPasswordChangedDomainEvent } from "@/iam/domain/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class SecurityAuditListener {
	constructor(
		private readonly enqueuePasswordChangedAlertUseCase: EnqueuePasswordChangedAlertUseCasePort,
		private readonly enqueueEmailChangedAlertUseCase: EnqueueEmailChangedAlertUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent("UserPasswordChangedDomainEvent", { async: true })
	public async handlePasswordChanged(event: UserPasswordChangedDomainEvent): Promise<void> {
		try {
			const command = new EnqueuePasswordChangedAlertCommand(event.email);
			await this.enqueuePasswordChangedAlertUseCase.execute(command);
		} catch {
			this.logger.error(`Failed to enqueue password changed alert for ${event.email}`);
		}
	}

	@OnEvent("UserEmailChangedDomainEvent", { async: true })
	public async handleEmailChanged(event: UserEmailChangedDomainEvent): Promise<void> {
		try {
			const command = new EnqueueEmailChangedAlertCommand(event.oldEmail, event.newEmail);
			await this.enqueueEmailChangedAlertUseCase.execute(command);
		} catch {
			this.logger.error(`Failed to enqueue email changed alert for ${event.oldEmail}`);
		}
	}
}
