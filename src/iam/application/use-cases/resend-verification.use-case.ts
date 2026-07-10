import { Injectable, Logger } from "@nestjs/common";
import { Email } from "@/iam/domain/value-objects";
import { EmailDispatchFailedException } from "../exceptions";
import {
	ResendVerificationCommand,
	ResendVerificationResult,
	ResendVerificationUseCasePort,
} from "../ports/inbound";
import {
	EmailQueueServicePort,
	IamRepositoryPort,
	VerificationTokenGeneratorPort,
} from "../ports/outbound";

@Injectable()
export class ResendVerificationUsecase implements ResendVerificationUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly emailQueueService: EmailQueueServicePort,
		private readonly tokenGenerator: VerificationTokenGeneratorPort,
	) {}

	private readonly logger = new Logger(ResendVerificationUsecase.name);

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
		const tokenExpiresInMs = 24 * 60 * 60 * 1000;

		user.refreshVerificationToken(newVerificationToken, tokenExpiresInMs);
		await this.iamRepository.save(user);

		try {
			await this.emailQueueService.enqueueVerificationEmail(
				user.email.getValue(),
				newVerificationToken,
			);
		} catch {
			this.logger.error(
				`Queue failed. Restoring previous verification token for: ${command.email}`,
			);

			user.rollbackVerificationToken(previousToken, previousExpiresAt);
			await this.iamRepository.save(user);

			throw new EmailDispatchFailedException(
				"We are currently experiencing issues sending emails. Please try again later.",
			);
		}

		return { message: "A new verification email has been sent." };
	}
}
