import { Injectable } from "@nestjs/common";
import {
	EnqueueVerificationEmailCommand,
	EnqueueVerificationEmailUseCasePort,
} from "../../ports/inbound/authentication";
import { EmailQueueServicePort, TimeFormatterPort } from "../../ports/outbound";

@Injectable()
export class EnqueueVerificationEmailUseCase implements EnqueueVerificationEmailUseCasePort {
	constructor(
		private readonly emailQueueService: EmailQueueServicePort,
		private readonly timeFormatter: TimeFormatterPort,
	) {}

	public async execute(command: EnqueueVerificationEmailCommand): Promise<void> {
		const tokenExpiresInText = this.timeFormatter.formatToHumanReadable(command.tokenExpiresInMs);

		await this.emailQueueService.enqueueVerificationEmail(
			command.email,
			command.verificationToken,
			tokenExpiresInText,
		);
	}
}
