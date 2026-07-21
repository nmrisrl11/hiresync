import {
	EnqueueWelcomeEmailCommand,
	EnqueueWelcomeEmailUseCasePort,
} from "@/iam/application/ports/inbound/authentication/notifications";
import { Injectable } from "@nestjs/common";
import { IamEmailQueuePort } from "../../../ports/outbound";

@Injectable()
export class EnqueueWelcomeEmailUseCase implements EnqueueWelcomeEmailUseCasePort {
	constructor(private readonly emailQueueService: IamEmailQueuePort) {}

	public async execute(command: EnqueueWelcomeEmailCommand): Promise<void> {
		await this.emailQueueService.enqueueWelcomeEmail(command.email);
	}
}
