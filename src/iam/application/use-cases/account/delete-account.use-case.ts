import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import {
	DomainEventDispatcherPort,
	IntegrationEventPublisherPort,
} from "@/shared/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "../../exceptions";
import { DeleteAccountCommand, DeleteAccountUseCasePort } from "../../ports/inbound/account";
import { UserAccountDeletingIntegrationEvent } from "@/shared/infrastructure/events/integration";

@Injectable()
export class DeleteAccountUseCase implements DeleteAccountUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly eventDispatcher: DomainEventDispatcherPort,
		private readonly integrationEventPublisher: IntegrationEventPublisherPort,
	) {}

	public async execute(command: DeleteAccountCommand): Promise<void> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user) throw new UserNotFoundException();

		await this.integrationEventPublisher.publishAsync(
			new UserAccountDeletingIntegrationEvent(command.userId),
		);

		user.delete();

		await this.userRepository.delete(userIdVo);

		await this.eventDispatcher.dispatchMultiple(user.domainEvents);
		user.clearEvents();
	}
}
