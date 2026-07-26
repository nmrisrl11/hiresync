import { UserRepository } from "@/iam/domain/repositories";
import { DomainEventPublisherPort } from "@/shared/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import { InvalidTokenException } from "../../exceptions";
import {
	ResetPasswordCommand,
	ResetPasswordResult,
	ResetPasswordUseCasePort,
} from "../../ports/inbound/authentication";
import { HashServicePort } from "../../ports/outbound";

@Injectable()
export class ResetPasswordUseCase implements ResetPasswordUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly hashService: HashServicePort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: ResetPasswordCommand): Promise<ResetPasswordResult> {
		const user = await this.userRepository.findByResetToken(command.token);

		if (!user || !user.account?.getResetToken())
			throw new InvalidTokenException("Reset token not found or invalid.");

		const passwordHash = await this.hashService.hash(command.password, 12);

		user.changePassword(command.token, passwordHash);

		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();

		return { message: "Password reset successful. You can now login." };
	}
}
