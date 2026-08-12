import { UserRepository } from "@/iam/domain/repositories";
import { SessionId, UserId } from "@/iam/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "../../exceptions";
import { RevokeSessionCommand, RevokeSessionUseCasePort } from "../../ports/inbound/account";

@Injectable()
export class RevokeSessionUseCase implements RevokeSessionUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: RevokeSessionCommand): Promise<void> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user) throw new UserNotFoundException();

		const sessionIdVo = new SessionId(command.targetSessionId);
		user.revokeSession(sessionIdVo);

		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();
	}
}
