import {
	EnqueueAccountDeletionScheduledEmailCommand,
	EnqueueAccountDeletionScheduledEmailUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { UserAccountDeletionScheduledDomainEvent } from "@/iam/domain/events/account";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class UserAccountDeletionScheduledListener {
	constructor(
		private readonly enqueueAccountDeletionScheduledEmailUseCase: EnqueueAccountDeletionScheduledEmailUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(UserAccountDeletionScheduledDomainEvent.name, { async: true })
	public async handle(event: UserAccountDeletionScheduledDomainEvent): Promise<void> {
		try {
			if (!event.scheduledForDeletionAt) return;

			const command = new EnqueueAccountDeletionScheduledEmailCommand(
				event.email,
				event.scheduledForDeletionAt,
			);

			await this.enqueueAccountDeletionScheduledEmailUseCase.execute(command);
		} catch (error) {
			this.logger.error(
				`Unable to queue account deletion scheduled email for ${event.email}`,
				error instanceof Error ? error.stack : "Unknown error",
			);
		}
	}
}
