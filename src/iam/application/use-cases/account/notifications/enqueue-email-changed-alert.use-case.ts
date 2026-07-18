import {
	EnqueueEmailChangedAlertCommand,
	EnqueueEmailChangedAlertUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { EmailQueueServicePort } from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EnqueueEmailChangedAlertUseCase implements EnqueueEmailChangedAlertUseCasePort {
	constructor(private readonly emailQueueService: EmailQueueServicePort) {}
	public async execute(command: EnqueueEmailChangedAlertCommand): Promise<void> {
		await this.emailQueueService.enqueueEmailChangedAlertEmail(command.oldEmail, command.newEmail);
	}
}
