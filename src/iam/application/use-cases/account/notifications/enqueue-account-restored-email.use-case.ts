import {
	EnqueueAccountRestoredEmailCommand,
	EnqueueAccountRestoredEmailUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { IamEmailQueuePort } from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EnqueueAccountRestoredEmailUseCase implements EnqueueAccountRestoredEmailUseCasePort {
	constructor(private readonly emailQueueService: IamEmailQueuePort) {}

	public async execute(command: EnqueueAccountRestoredEmailCommand): Promise<void> {
		await this.emailQueueService.enqueueAccountRestoredEmail(command.email);
	}
}
