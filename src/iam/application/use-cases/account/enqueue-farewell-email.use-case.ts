import { Injectable } from "@nestjs/common";
import {
	EnqueueFarewellEmailCommand,
	EnqueueFarewellEmailUseCasePort,
} from "../../ports/inbound/account";
import { EmailQueueServicePort } from "../../ports/outbound";

@Injectable()
export class EnqueueFarewellEmailUseCase implements EnqueueFarewellEmailUseCasePort {
	constructor(private readonly emailQueueService: EmailQueueServicePort) {}

	public async execute(command: EnqueueFarewellEmailCommand): Promise<void> {
		await this.emailQueueService.enqueueFarewellEmail(command.email);
	}
}
