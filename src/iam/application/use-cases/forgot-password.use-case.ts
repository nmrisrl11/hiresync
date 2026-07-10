import { Injectable, Logger } from "@nestjs/common";
import { Email } from "@/iam/domain/value-objects";
import { EmailDispatchFailedException } from "../exceptions";
import {
	ForgotPasswordCommand,
	ForgotPasswordResult,
	ForgotPasswordUseCasePort,
} from "../ports/inbound";
import {
	EmailQueueServicePort,
	IamRepositoryPort,
	VerificationTokenGeneratorPort,
} from "../ports/outbound";

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

		try {
			await this.emailQueueService.enqueuePasswordResetEmail(user.email.getValue(), resetToken);
		} catch {
			this.logger.error(`Queue failed. Restoring previous reset token for: ${command.email}`);

			user.rollbackResetToken();
			await this.iamRepository.save(user);

			throw new EmailDispatchFailedException(
				"We are currently experiencing issues sending emails. Please try again later.",
			);
		}

		return { message: "If account with that email exists, a reset link has been sent." };
	}
}
