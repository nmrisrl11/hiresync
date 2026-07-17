import { Injectable } from "@nestjs/common";
import { DeleteAccountCommand, DeleteAccountUseCasePort } from "../../ports/inbound/account";
import { IamRepositoryPort } from "../../ports/outbound";
import { UserNotFoundException } from "../../exceptions";
import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";

@Injectable()
export class DeleteAccountUseCase implements DeleteAccountUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly eventDispatcher: DomainEventDispatcherPort,
	) {}

	public async execute(command: DeleteAccountCommand): Promise<void> {
		const user = await this.iamRepository.findById(command.userId);

		if (!user) throw new UserNotFoundException();

		user.delete();

		await this.iamRepository.delete(command.userId);

		await this.eventDispatcher.dispatchMultiple(user.domainEvents);
		user.clearEvents();
	}
}
