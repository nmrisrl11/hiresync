import {
	EnqueueFarewellEmailCommand,
	EnqueueFarewellEmailUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { ImageStoragePort } from "@/iam/application/ports/outbound";
import { UserAccountDeletedDomainEvent } from "@/iam/domain/events/account";
import { EVENT_NAMES } from "@/shared/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class UserAccountDeletedListener {
	constructor(
		private readonly logger: LoggerPort,
		private readonly enqueueFarewellEmailUseCase: EnqueueFarewellEmailUseCasePort,
		private readonly imageStorage: ImageStoragePort,
	) {}

	@OnEvent(EVENT_NAMES.USER_ACCOUNT_DELETED, { async: true })
	public async handleAccountDeleted(event: UserAccountDeletedDomainEvent): Promise<void> {
		try {
			const command = new EnqueueFarewellEmailCommand(event.email);
			await this.enqueueFarewellEmailUseCase.execute(command);
		} catch {
			this.logger.error(`Failed to enqueue farewell email for ${event.email}`);
		}

		if (event.avatarImage) {
			try {
				this.logger.log(
					`Deleting orphaned avatar for user ${event.userId} from external storage...`,
				);

				await this.imageStorage.deleteImage(event.avatarImage);
			} catch {
				this.logger.error(`Failed to delete external image for ${event.userId}`);
			}
		}
	}
}
