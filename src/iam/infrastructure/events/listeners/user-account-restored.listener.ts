import {
	EnqueueAccountRestoredEmailCommand,
	EnqueueAccountRestoredEmailUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { UserAccountRestoredDomainEvent } from "@/iam/domain/events/account";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class UserAccountRestoredListener {
	constructor(
		private readonly enqueueAccountRestoredEmailUseCase: EnqueueAccountRestoredEmailUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(UserAccountRestoredDomainEvent.name, { async: true })
	public async handle(event: UserAccountRestoredDomainEvent): Promise<void> {
		try {
			const command = new EnqueueAccountRestoredEmailCommand(event.email);

			await this.enqueueAccountRestoredEmailUseCase.execute(command);
		} catch (error) {
			this.logger.error(
				`Unable to queue account restored email for ${event.email}`,
				error instanceof Error ? error.stack : "Unknown error",
			);
		}
	}
}
