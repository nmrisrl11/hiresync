import { Injectable } from "@nestjs/common";
import {
	EnqueueWelcomeEmailCommand,
	EnqueueWelcomeEmailUseCasePort,
} from "../../ports/inbound/authentication";
import { EmailQueueServicePort } from "../../ports/outbound";

@Injectable()
export class EnqueueWelcomeEmailUseCase implements EnqueueWelcomeEmailUseCasePort {
	constructor(private readonly emailQueueService: EmailQueueServicePort) {}

	public async execute(command: EnqueueWelcomeEmailCommand): Promise<void> {
		await this.emailQueueService.enqueueWelcomeEmail(command.email);
	}
}
