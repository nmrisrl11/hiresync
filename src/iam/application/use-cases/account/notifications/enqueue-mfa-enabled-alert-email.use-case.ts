import {
	EnqueueMfaEnabledAlertEmailCommand,
	EnqueueMfaEnabledAlertEmailUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { IamEmailQueuePort } from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EnqueueMfaEnabledAlertEmailUseCase implements EnqueueMfaEnabledAlertEmailUseCasePort {
	constructor(private readonly emailQueueService: IamEmailQueuePort) {}

	public async execute(command: EnqueueMfaEnabledAlertEmailCommand): Promise<void> {
		await this.emailQueueService.enqueueMfaEnabledAlertEmail(command.email);
	}
}
