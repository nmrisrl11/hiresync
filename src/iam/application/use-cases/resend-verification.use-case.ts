import { Injectable, Logger } from "@nestjs/common";
import {
	ResendVerificationCommand,
	ResendVerificationResult,
	ResendVerificationUseCasePort,
} from "../ports/inbound/resend-verification.in-port";
import { IamRepositoryPort } from "../ports/outbound/iam.repository.port";
import { EmailQueueServicePort } from "../ports/outbound/email-queue.service.port";
import { VerificationTokenGeneratorPort } from "../ports/outbound/verification-token-generator.port";
import { Email } from "@/iam/domain/value-objects/email.value-object";
import { QueueProcessingException } from "../exceptions/application.exception";

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

		const emailQueued = await this.emailQueueService.enqueueVerificationEmail(
			user.email.getValue(),
			newVerificationToken,
		);

		if (!emailQueued) {
			this.logger.error(
				`Queue failed. Restoring previous verification token for: ${command.email}`,
			);

			user.rollbackVerificationToken(previousToken, previousExpiresAt);
			await this.iamRepository.save(user);

			throw new QueueProcessingException(
				"We are currently experiencing issues sending emails. Please try again later.",
			);
		}

		return { message: "A new verification email has been sent." };
	}
}
