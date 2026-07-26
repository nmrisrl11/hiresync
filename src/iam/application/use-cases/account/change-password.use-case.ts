import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import { InvalidPasswordException, UserNotFoundException } from "../../exceptions";
import { ChangePasswordCommand, ChangePasswordUseCasePort } from "../../ports/inbound/account";
import { HashServicePort } from "../../ports/outbound";

@Injectable()
export class ChangePasswordUseCase implements ChangePasswordUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly hashService: HashServicePort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: ChangePasswordCommand): Promise<void> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);

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

		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();
	}
}
