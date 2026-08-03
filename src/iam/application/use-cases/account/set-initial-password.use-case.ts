import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { Injectable } from "@nestjs/common";
import { PasswordAlreadySetException, UserNotFoundException } from "../../exceptions";
import {
	SetInitialPasswordCommand,
	SetInitialPasswordUseCasePort,
} from "../../ports/inbound/account";
import { HashServicePort } from "../../ports/outbound";

@Injectable()
export class SetInitialPasswordUseCase implements SetInitialPasswordUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly hashService: HashServicePort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: SetInitialPasswordCommand): Promise<void> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user || !user.account) throw new UserNotFoundException();

		//! Check if the account already has a password set
		if (user.account.hasPassword()) throw new PasswordAlreadySetException();

		//! Hash the new password
		const newPasswordHash = await this.hashService.hash(command.newPassword, 12);

		//! Set the new password hash on the account
		user.updatePassword(newPasswordHash);

		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();
	}
}
