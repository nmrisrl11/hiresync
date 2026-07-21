import {
	EnqueuePasswordResetEmailCommand,
	EnqueuePasswordResetEmailUseCasePort,
} from "@/iam/application/ports/inbound/authentication/notifications";
import { Injectable } from "@nestjs/common";
import { IamEmailQueuePort, TimeFormatterPort } from "../../../ports/outbound";

@Injectable()
export class EnqueuePasswordResetEmailUseCase implements EnqueuePasswordResetEmailUseCasePort {
	constructor(
		private readonly emailQueueService: IamEmailQueuePort,
		private readonly timeFormatter: TimeFormatterPort,
	) {}

	public async execute(command: EnqueuePasswordResetEmailCommand): Promise<void> {
		const tokenExpiresInText = this.timeFormatter.formatToHumanReadable(command.tokenExpiresInMs);

		await this.emailQueueService.enqueuePasswordResetEmail(
			command.email,
			command.resetToken,
			tokenExpiresInText,
		);
	}
}
