import {
	EnqueueAccountDeletionScheduledEmailCommand,
	EnqueueAccountDeletionScheduledEmailUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { IamEmailQueuePort } from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EnqueueAccountDeletionScheduledEmailUseCase implements EnqueueAccountDeletionScheduledEmailUseCasePort {
	constructor(private readonly emailQueueService: IamEmailQueuePort) {}

	public async execute(command: EnqueueAccountDeletionScheduledEmailCommand): Promise<void> {
		await this.emailQueueService.enqueueAccountDeletionScheduledEmail(
			command.email,
			command.scheduledDate.toISOString(),
		);
	}
}
