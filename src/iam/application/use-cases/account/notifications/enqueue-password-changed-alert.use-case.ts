import {
	EnqueuePasswordChangedAlertCommand,
	EnqueuePasswordChangedAlertUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { EmailQueueServicePort } from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EnqueuePasswordChangedAlertUseCase implements EnqueuePasswordChangedAlertUseCasePort {
	constructor(private readonly emailQueueService: EmailQueueServicePort) {}
	public async execute(command: EnqueuePasswordChangedAlertCommand): Promise<void> {
		await this.emailQueueService.enqueuePasswordChangedAlertEmail(command.email);
	}
}
