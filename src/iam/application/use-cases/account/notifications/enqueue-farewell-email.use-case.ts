import {
	EnqueueFarewellEmailCommand,
	EnqueueFarewellEmailUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";
import { IamEmailQueuePort } from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EnqueueFarewellEmailUseCase implements EnqueueFarewellEmailUseCasePort {
	constructor(private readonly emailQueueService: IamEmailQueuePort) {}

	public async execute(command: EnqueueFarewellEmailCommand): Promise<void> {
		await this.emailQueueService.enqueueFarewellEmail(command.email);
	}
}
