import { UserRepository } from "@/iam/domain/repositories";
import { Email } from "@/iam/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { Injectable } from "@nestjs/common";
import {
	ForgotPasswordCommand,
	ForgotPasswordResult,
	ForgotPasswordUseCasePort,
} from "../../ports/inbound/authentication";
import {
	AuthConfigPort,
	TimeFormatterPort,
	VerificationTokenGeneratorPort,
} from "../../ports/outbound";

@Injectable()
export class ForgotPasswordUseCase implements ForgotPasswordUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly tokenGenerator: VerificationTokenGeneratorPort,
		private readonly timeFormatter: TimeFormatterPort,
		private readonly authConfig: AuthConfigPort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: ForgotPasswordCommand): Promise<ForgotPasswordResult> {
		const emailVo = new Email(command.email);
		const user = await this.userRepository.findByEmail(emailVo);

		if (!user)
			return {
				message: "If account with that email exists, a reset link has been sent.",
			};

		const resetToken = this.tokenGenerator.generateHexToken(32);

		const expiresInEnv = this.authConfig.getPasswordResetTokenExpiration();
		const tokenExpiresInMs = this.timeFormatter.parseToMilliseconds(expiresInEnv);

		user.setResetToken(resetToken, tokenExpiresInMs);
		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();

		return { message: "If account with that email exists, a reset link has been sent." };
	}
}
