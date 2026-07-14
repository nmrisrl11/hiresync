import { Injectable } from "@nestjs/common";
import {
	RequestEmailChangeCommand,
	RequestEmailChangeResult,
	RequestEmailChangeUseCasePort,
} from "../../ports/inbound/account";
import {
	AuthConfigPort,
	EmailQueueServicePort,
	IamRepositoryPort,
	TimeFormatterPort,
	VerificationTokenGeneratorPort,
} from "../../ports/outbound";
import { UserAlreadyExistsException, UserNotFoundException } from "../../exceptions";
import { Email } from "@/iam/domain/value-objects";
import { LoggerPort } from "@/shared/logger/ports/logger.port";

@Injectable()
export class RequestEmailChangeUseCase implements RequestEmailChangeUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly verificationTokenGenerator: VerificationTokenGeneratorPort,
		private readonly emailQueueService: EmailQueueServicePort,
		private readonly timeFormatter: TimeFormatterPort,
		private readonly authConfig: AuthConfigPort,
		private readonly logger: LoggerPort,
	) {}

	public async execute(command: RequestEmailChangeCommand): Promise<RequestEmailChangeResult> {
		const user = await this.iamRepository.findById(command.userId);
		if (!user) throw new UserNotFoundException();

		//! Check if the requested email is already in used
		const emailVo = new Email(command.newEmail);
		const existingUser = await this.iamRepository.findByEmail(emailVo);
		if (existingUser) throw new UserAlreadyExistsException();

		//! Generate new verification token
		const verificationToken = this.verificationTokenGenerator.generateHexToken(32);

		//! Generate new verification token expiration
		const expiresInEnv = this.authConfig.getVerificationTokenExpiration();
		const tokenExpiresInMs = this.timeFormatter.parseToMilliseconds(expiresInEnv);
		const tokenExpiresInText = this.timeFormatter.formatToHumanReadable(tokenExpiresInMs);

		user.requestEmailChange(command.newEmail, verificationToken, tokenExpiresInMs);

		await this.iamRepository.save(user);

		let changeEmailRequestEnqueued = true;

		try {
			await this.emailQueueService.enqueueChangeEmailRequestEmail(
				command.newEmail,
				verificationToken,
				tokenExpiresInText,
			);
		} catch {
			this.logger.warn(`Unable to queue change email request for ${user.email.getValue()}`);

			changeEmailRequestEnqueued = false;
		}

		return { changeEmailRequestEnqueued };
	}
}
