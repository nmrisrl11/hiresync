import { InvalidPasswordException, UserNotFoundException } from "@/iam/application/exceptions";
import {
	DisableMfaCommand,
	DisableMfaUseCasePort,
} from "@/iam/application/ports/inbound/account/mfa";
import { HashServicePort } from "@/iam/application/ports/outbound";
import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DisableMfaUseCase implements DisableMfaUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly hashService: HashServicePort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: DisableMfaCommand): Promise<void> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user || !user.account) throw new UserNotFoundException();

		//! Verify current password for security
		const isPasswordValid = await this.hashService.compare(
			command.currentPassword,
			user.account.getPasswordHash(),
		);

		if (!isPasswordValid) throw new InvalidPasswordException();

		user.disableMfa();

		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();
	}
}
