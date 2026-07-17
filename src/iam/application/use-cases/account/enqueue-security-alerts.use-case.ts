import { Injectable } from "@nestjs/common";
import {
	EnqueueEmailChangedAlertCommand,
	EnqueueEmailChangedAlertUseCasePort,
	EnqueuePasswordChangedAlertCommand,
	EnqueuePasswordChangedAlertUseCasePort,
} from "../../ports/inbound/account";
import { EmailQueueServicePort } from "../../ports/outbound";

@Injectable()
export class EnqueuePasswordChangedAlertUseCase implements EnqueuePasswordChangedAlertUseCasePort {
	constructor(private readonly emailQueueService: EmailQueueServicePort) {}
	public async execute(command: EnqueuePasswordChangedAlertCommand): Promise<void> {
		await this.emailQueueService.enqueuePasswordChangedAlertEmail(command.email);
	}
}

@Injectable()
export class EnqueueEmailChangedAlertUseCase implements EnqueueEmailChangedAlertUseCasePort {
	constructor(private readonly emailQueueService: EmailQueueServicePort) {}
	public async execute(command: EnqueueEmailChangedAlertCommand): Promise<void> {
		await this.emailQueueService.enqueueEmailChangedAlertEmail(command.oldEmail, command.newEmail);
	}
}
