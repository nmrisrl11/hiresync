import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "../../exceptions";
import {
	ScheduleAccountDeletionCommand,
	ScheduleAccountDeletionUseCasePort,
} from "../../ports/inbound/account";
import { EnvConfigPort, TimeFormatterPort } from "../../ports/outbound";

@Injectable()
export class ScheduleAccountDeletionUseCase implements ScheduleAccountDeletionUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly envConfig: EnvConfigPort,
		private readonly timeFormatter: TimeFormatterPort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: ScheduleAccountDeletionCommand): Promise<void> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user) throw new UserNotFoundException();

		const gracePeriodInEnv = this.envConfig.getGracePeriodAccountDeletion();
		const gracePeriodMs = this.timeFormatter.parseToMilliseconds(gracePeriodInEnv);

		user.scheduleDeletion(gracePeriodMs);

		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();
	}
}
