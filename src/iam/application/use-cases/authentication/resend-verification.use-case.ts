import { UserRepository } from "@/iam/domain/repositories";
import { Email } from "@/iam/domain/value-objects";
import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import {
	ResendVerificationCommand,
	ResendVerificationResult,
	ResendVerificationUseCasePort,
} from "../../ports/inbound/authentication";
import {
	AuthConfigPort,
	TimeFormatterPort,
	VerificationTokenGeneratorPort,
} from "../../ports/outbound";

@Injectable()
export class ResendVerificationUsecase implements ResendVerificationUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly tokenGenerator: VerificationTokenGeneratorPort,
		private readonly timeFormatter: TimeFormatterPort,
		private readonly authConfig: AuthConfigPort,
		private readonly eventDispatcher: DomainEventDispatcherPort,
	) {}

	public async execute(command: ResendVerificationCommand): Promise<ResendVerificationResult> {
		const emailVo = new Email(command.email);
		const user = await this.userRepository.findByEmail(emailVo);

		if (!user || user.isVerified) {
			return {
				message:
					"If an unverified account exists for that email, a verification email has been sent.",
			};
		}

		const newVerificationToken = this.tokenGenerator.generateHexToken(32);

		const expiresInEnv = this.authConfig.getVerificationTokenExpiration();
		const tokenExpiresInMs = this.timeFormatter.parseToMilliseconds(expiresInEnv);

		user.refreshVerificationToken(newVerificationToken, tokenExpiresInMs);
		await this.userRepository.save(user);

		await this.eventDispatcher.dispatchMultiple(user.domainEvents);
		user.clearEvents();

		return { message: "A new verification email has been sent." };
	}
}
