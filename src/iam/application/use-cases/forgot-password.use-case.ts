import { Injectable, Logger } from "@nestjs/common";
import { Email } from "@/iam/domain/value-objects";
import { EmailDispatchFailedException } from "../exceptions";
import {
	ForgotPasswordCommand,
	ForgotPasswordResult,
	ForgotPasswordUseCasePort,
} from "../ports/inbound";
import {
	AuthConfigPort,
	EmailQueueServicePort,
	IamRepositoryPort,
	TimeFormatterPort,
	VerificationTokenGeneratorPort,
} from "../ports/outbound";

@Injectable()
export class ForgotPasswordUseCase implements ForgotPasswordUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly emailQueueService: EmailQueueServicePort,
		private readonly tokenGenerator: VerificationTokenGeneratorPort,
		private readonly timeFormatter: TimeFormatterPort,
		private readonly authConfig: AuthConfigPort,
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

		const expiresInEnv = this.authConfig.getVerificationTokenExpiration();
		const tokenExpiresInMs = this.timeFormatter.parseToMilliseconds(expiresInEnv);
		const tokenExpiresInText = this.timeFormatter.formatToHumanReadable(tokenExpiresInMs);

		user.setResetToken(resetToken, tokenExpiresInMs);
		await this.iamRepository.save(user);

		try {
			await this.emailQueueService.enqueuePasswordResetEmail(
				user.email.getValue(),
				resetToken,
				tokenExpiresInText,
			);
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
