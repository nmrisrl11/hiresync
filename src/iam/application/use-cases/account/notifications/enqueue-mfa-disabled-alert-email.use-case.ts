import {
	EnqueueMfaDisabledAlertEmailCommand,
	EnqueueMfaDisabledAlertEmailUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { IamEmailQueuePort } from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EnqueueMfaDisabledAlertEmailUseCase implements EnqueueMfaDisabledAlertEmailUseCasePort {
	constructor(private readonly emailQueueService: IamEmailQueuePort) {}

	public async execute(command: EnqueueMfaDisabledAlertEmailCommand): Promise<void> {
		await this.emailQueueService.enqueueMfaDisabledAlertEmail(command.email);
	}
}
