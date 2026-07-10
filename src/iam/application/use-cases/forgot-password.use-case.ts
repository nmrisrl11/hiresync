import { Injectable, Logger } from "@nestjs/common";
import {
	ForgotPasswordCommand,
	ForgotPasswordResult,
	ForgotPasswordUseCasePort,
} from "../ports/inbound/forgot-password.in-port";
import { IamRepositoryPort } from "../ports/outbound/iam.repository.port";
import { EmailQueueServicePort } from "../ports/outbound/email-queue.service.port";
import { VerificationTokenGeneratorPort } from "../ports/outbound/verification-token-generator.port";
import { Email } from "@/iam/domain/value-objects/email.value-object";
import { QueueProcessingException } from "../exceptions/application.exception";

@Injectable()
export class ForgotPasswordUseCase implements ForgotPasswordUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly emailQueueService: EmailQueueServicePort,
		private readonly tokenGenerator: VerificationTokenGeneratorPort,
	) {}

	private readonly logger = new Logger(ForgotPasswordUseCase.name);

	public async execute(command: ForgotPasswordCommand): Promise<ForgotPasswordResult> {
		const emailVo = new Email(command.email);
		const user = await this.iamRepository.findByEmail(emailVo);

		if (!user)
			return {
				message: "If account with that email exists, a reset link has been sent.",
			};

		const resetToken = this.tokenGenerator.generateHexToken(32);
		const resetTokenExpiresAt = 60 * 60 * 1000; // 1 hour

		user.setResetToken(resetToken, resetTokenExpiresAt);
		await this.iamRepository.save(user);

		const emailQueued = await this.emailQueueService.enqueuePasswordResetEmail(
			user.email.getValue(),
			resetToken,
		);

		if (!emailQueued) {
			this.logger.error(`Queue failed. Restoring previous reset token for: ${command.email}`);

			user.rollbackResetToken();
			await this.iamRepository.save(user);

			throw new QueueProcessingException(
				"We are currently experiencing issues sending emails. Please try again later.",
			);
		}

		return { message: "If account with that email exists, a reset link has been sent." };
	}
}
