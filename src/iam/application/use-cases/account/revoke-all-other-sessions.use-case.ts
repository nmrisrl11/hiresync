import { UserRepository } from "@/iam/domain/repositories";
import { SessionId, UserId } from "@/iam/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "../../exceptions";
import {
	RevokeAllOtherSessionsCommand,
	RevokeAllOtherSessionsUseCasePort,
} from "../../ports/inbound/account";

@Injectable()
export class RevokeAllOtherSessionsUseCase implements RevokeAllOtherSessionsUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: RevokeAllOtherSessionsCommand): Promise<void> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user) throw new UserNotFoundException();

		const currentSessionIdVo = new SessionId(command.currentSessionId);
		user.revokeAllOtherSessions(currentSessionIdVo);

		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();
	}
}
