import { Email } from "@/iam/domain/value-objects";
import { Injectable } from "@nestjs/common";
import { EmailDispatchFailedException } from "../../exceptions";
import {
	AuthConfigPort,
	EmailQueueServicePort,
	IamRepositoryPort,
	TimeFormatterPort,
	VerificationTokenGeneratorPort,
} from "../../ports/outbound";
import {
	ResendVerificationCommand,
	ResendVerificationResult,
	ResendVerificationUseCasePort,
} from "../../ports/inbound/authentication";
import { LoggerPort } from "@/shared/logger/ports/logger.port";

@Injectable()
export class ResendVerificationUsecase implements ResendVerificationUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly emailQueueService: EmailQueueServicePort,
		private readonly tokenGenerator: VerificationTokenGeneratorPort,
		private readonly timeFormatter: TimeFormatterPort,
		private readonly authConfig: AuthConfigPort,
		private readonly logger: LoggerPort,
	) {}

	public async execute(command: ResendVerificationCommand): Promise<ResendVerificationResult> {
		const emailVo = new Email(command.email);
		const user = await this.iamRepository.findByEmail(emailVo);

		if (!user || user.isVerified) {
			return {
				message:
					"If an unverified account exists for that email, a verification email has been sent.",
			};
		}

		const previousToken = user.account?.getVerificationToken() ?? null;
		const previousExpiresAt = user.account?.getVerificationTokenExpiresAt() ?? null;

		const newVerificationToken = this.tokenGenerator.generateHexToken(32);

		const expiresInEnv = this.authConfig.getVerificationTokenExpiration();
		const tokenExpiresInMs = this.timeFormatter.parseToMilliseconds(expiresInEnv);
		const tokenExpiresInText = this.timeFormatter.formatToHumanReadable(tokenExpiresInMs);

		user.refreshVerificationToken(newVerificationToken, tokenExpiresInMs);
		await this.iamRepository.save(user);

		try {
			await this.emailQueueService.enqueueVerificationEmail(
				user.email.getValue(),
				newVerificationToken,
				tokenExpiresInText,
			);
		} catch {
			this.logger.error(
				`Queue failed. Restoring previous verification token for: ${command.email}`,
			);

			user.rollbackVerificationToken(previousToken, previousExpiresAt);
			await this.iamRepository.save(user);

			throw new EmailDispatchFailedException();
		}

		return { message: "A new verification email has been sent." };
	}
}
