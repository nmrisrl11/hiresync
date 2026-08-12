import { UserRepository } from "@/iam/domain/repositories";
import { SessionId, UserId } from "@/iam/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "../../exceptions";
import { LogoutCommand, LogoutUseCasePort } from "../../ports/inbound/authentication";

@Injectable()
export class LogoutUseCase implements LogoutUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: LogoutCommand): Promise<void> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user) throw new UserNotFoundException();

		//! Revoke specific session
		const sessionIdVo = new SessionId(command.sessionId);
		user.revokeSession(sessionIdVo);

		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();
	}
}
