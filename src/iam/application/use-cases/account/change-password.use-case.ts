import { Injectable } from "@nestjs/common";
import { ChangePasswordCommand, ChangePasswordUseCasePort } from "../../ports/inbound/account";
import { HashServicePort, IamRepositoryPort } from "../../ports/outbound";
import { InvalidPasswordException, UserNotFoundException } from "../../exceptions";
import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";

@Injectable()
export class ChangePasswordUseCase implements ChangePasswordUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly hashService: HashServicePort,
		private readonly eventDispatcher: DomainEventDispatcherPort,
	) {}

	public async execute(command: ChangePasswordCommand): Promise<void> {
		const user = await this.iamRepository.findById(command.userId);

		if (!user || !user.account) throw new UserNotFoundException();

		//! Verify the current password
		const isPasswordValid = await this.hashService.compare(
			command.currentPassword,
			user.account.getPasswordHash(),
		);

		if (!isPasswordValid) throw new InvalidPasswordException();

		//! Hash the new password and update the entity
		const newPasswordHash = await this.hashService.hash(command.newPassword, 12);
		user.updatePassword(newPasswordHash);

		await this.iamRepository.save(user);

		await this.eventDispatcher.dispatchMultiple(user.domainEvents);
		user.clearEvents();
	}
}
