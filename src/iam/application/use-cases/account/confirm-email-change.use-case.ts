import { UserRepository } from "@/iam/domain/repositories";
import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import { InvalidTokenException } from "../../exceptions";
import {
	ConfirmEmailChangeCommand,
	ConfirmEmailChangeUseCasePort,
} from "../../ports/inbound/account";

@Injectable()
export class ConfirmEmailChangeUseCase implements ConfirmEmailChangeUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly eventDispatcher: DomainEventDispatcherPort,
	) {}

	public async execute(command: ConfirmEmailChangeCommand): Promise<void> {
		const user = await this.userRepository.findByVerificationToken(command.token);

		if (!user) throw new InvalidTokenException("Verification token not found or invalid.");

		user.confirmEmailChange(command.token);

		await this.userRepository.save(user);

		await this.eventDispatcher.dispatchMultiple(user.domainEvents);
		user.clearEvents();
	}
}
