import {
	EnqueueFarewellEmailCommand,
	EnqueueFarewellEmailUseCasePort,
} from "@/iam/application/ports/inbound/account";
import {
	EnqueueWelcomeEmailCommand,
	EnqueueWelcomeEmailUseCasePort,
} from "@/iam/application/ports/inbound/authentication";
import { ImageStoragePort } from "@/iam/application/ports/outbound";
import { UserAccountDeletedDomainEvent, UserEmailVerifiedDomainEvent } from "@/iam/domain/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class LifecycleCleanupListener {
	constructor(
		private readonly logger: LoggerPort,
		private readonly enqueueWelcomeEmailUseCase: EnqueueWelcomeEmailUseCasePort,
		private readonly enqueueFarewellEmailUseCase: EnqueueFarewellEmailUseCasePort,
		private readonly imageStorage: ImageStoragePort,
	) {}

	@OnEvent("UserEmailVerifiedDomainEvent", { async: true })
	public async handleUserVerified(event: UserEmailVerifiedDomainEvent): Promise<void> {
		try {
			const command = new EnqueueWelcomeEmailCommand(event.email);
			await this.enqueueWelcomeEmailUseCase.execute(command);
		} catch {
			this.logger.error(`Failed to enqueue welcome email for ${event.email}`);
		}
	}

	@OnEvent("UserAccountDeletedDomainEvent", { async: true })
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
