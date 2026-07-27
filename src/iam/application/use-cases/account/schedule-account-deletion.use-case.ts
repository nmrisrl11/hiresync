import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "../../exceptions";
import {
	ScheduleAccountDeletionCommand,
	ScheduleAccountDeletionUseCasePort,
} from "../../ports/inbound/account";

const GRACE_PERIOD_MS = 14 * 24 * 60 * 60 * 1000; //! 14 Days

@Injectable()
export class ScheduleAccountDeletionUseCase implements ScheduleAccountDeletionUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: ScheduleAccountDeletionCommand): Promise<void> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user) throw new UserNotFoundException();

		user.scheduleDeletion(GRACE_PERIOD_MS);

		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();
	}
}
