import { Injectable } from "@nestjs/common";
import {
	EnqueueVerificationEmailCommand,
	EnqueueVerificationEmailUseCasePort,
} from "@/iam/application/ports/inbound/authentication/notifications";
import { IamEmailQueuePort, TimeFormatterPort } from "../../../ports/outbound";

@Injectable()
export class EnqueueVerificationEmailUseCase implements EnqueueVerificationEmailUseCasePort {
	constructor(
		private readonly emailQueueService: IamEmailQueuePort,
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
