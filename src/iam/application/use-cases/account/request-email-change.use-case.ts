import { Email } from "@/iam/domain/value-objects";
import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import { UserAlreadyExistsException, UserNotFoundException } from "../../exceptions";
import {
	RequestEmailChangeCommand,
	RequestEmailChangeUseCasePort,
} from "../../ports/inbound/account";
import {
	AuthConfigPort,
	IamRepositoryPort,
	TimeFormatterPort,
	VerificationTokenGeneratorPort,
} from "../../ports/outbound";

@Injectable()
export class RequestEmailChangeUseCase implements RequestEmailChangeUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly verificationTokenGenerator: VerificationTokenGeneratorPort,
		private readonly timeFormatter: TimeFormatterPort,
		private readonly authConfig: AuthConfigPort,
		private readonly eventDispatcher: DomainEventDispatcherPort,
	) {}

	public async execute(command: RequestEmailChangeCommand): Promise<void> {
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

		user.requestEmailChange(command.newEmail, verificationToken, tokenExpiresInMs);

		await this.iamRepository.save(user);

		await this.eventDispatcher.dispatchMultiple(user.domainEvents);
		user.clearEvents();
	}
}
