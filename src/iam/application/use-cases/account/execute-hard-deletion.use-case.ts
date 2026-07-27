import { UserRepository } from "@/iam/domain/repositories";
import { UserAccountDeletingIntegrationEvent } from "@/shared/events";
import { DomainEventPublisherPort, IntegrationEventPublisherPort } from "@/shared/events/ports";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { ExecuteHardDeletionUseCasePort } from "../../ports/inbound/account";

@Injectable()
export class ExecuteHardDeletionUseCase implements ExecuteHardDeletionUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly domainEventPublisher: DomainEventPublisherPort,
		private readonly integrationEventPublisher: IntegrationEventPublisherPort,
		private readonly logger: LoggerPort,
	) {}

	public async execute(): Promise<void> {
		const now = new Date();
		const usersToDelete = await this.userRepository.findPendingDeletions(now);

		for (const user of usersToDelete) {
			try {
				await this.integrationEventPublisher.publishAsync(
					new UserAccountDeletingIntegrationEvent(user.id.getValue()),
				);

				user.delete();

				await this.userRepository.delete(user.id);

				await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
				user.clearEvents();

				this.logger.log(`Successfully hard-deleted user ${user.id.getValue()}`);
			} catch (error) {
				this.logger.error(
					`Failed to execute hard deletion for user ${user.id.getValue()}`,
					(error as Error).stack,
				);
			}
		}
	}
}
