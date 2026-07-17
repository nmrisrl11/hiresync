import { Injectable } from "@nestjs/common";
import {
	EnqueueChangeEmailRequestCommand,
	EnqueueChangeEmailRequestUseCasePort,
} from "../../ports/inbound/account";
import { EmailQueueServicePort, TimeFormatterPort } from "../../ports/outbound";

@Injectable()
export class EnqueueChangeEmailRequestUseCase implements EnqueueChangeEmailRequestUseCasePort {
	constructor(
		private readonly emailQueueService: EmailQueueServicePort,
		private readonly timeFormatter: TimeFormatterPort,
	) {}

	public async execute(command: EnqueueChangeEmailRequestCommand): Promise<void> {
		const tokenExpiresInText = this.timeFormatter.formatToHumanReadable(command.tokenExpiresInMs);

		await this.emailQueueService.enqueueChangeEmailRequestEmail(
			command.email,
			command.changeToken,
			tokenExpiresInText,
		);
	}
}
