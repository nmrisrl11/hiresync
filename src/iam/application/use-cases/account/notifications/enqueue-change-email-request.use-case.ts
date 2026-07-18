import { Injectable } from "@nestjs/common";
import { EmailQueueServicePort, TimeFormatterPort } from "../../../ports/outbound";
import {
	EnqueueChangeEmailRequestCommand,
	EnqueueChangeEmailRequestUseCasePort,
} from "@/iam/application/ports/inbound/account/notifications";

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
