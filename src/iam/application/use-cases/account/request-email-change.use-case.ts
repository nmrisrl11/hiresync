import { UserRepository } from "@/iam/domain/repositories";
import { Email, UserId } from "@/iam/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { Injectable } from "@nestjs/common";
import { UserAlreadyExistsException, UserNotFoundException } from "../../exceptions";
import {
	RequestEmailChangeCommand,
	RequestEmailChangeUseCasePort,
} from "../../ports/inbound/account";
import {
	AuthConfigPort,
	TimeFormatterPort,
	VerificationTokenGeneratorPort,
} from "../../ports/outbound";

@Injectable()
export class RequestEmailChangeUseCase implements RequestEmailChangeUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly verificationTokenGenerator: VerificationTokenGeneratorPort,
		private readonly timeFormatter: TimeFormatterPort,
		private readonly authConfig: AuthConfigPort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: RequestEmailChangeCommand): Promise<void> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);
		if (!user) throw new UserNotFoundException();

		//! Check if the requested email is already in used
		const emailVo = new Email(command.newEmail);
		const existingUser = await this.userRepository.findByEmail(emailVo);
		if (existingUser) throw new UserAlreadyExistsException();

		//! Generate new verification token
		const verificationToken = this.verificationTokenGenerator.generateHexToken(32);

		//! Generate new verification token expiration
		const expiresInEnv = this.authConfig.getVerificationTokenExpiration();
		const tokenExpiresInMs = this.timeFormatter.parseToMilliseconds(expiresInEnv);

		user.requestEmailChange(command.newEmail, verificationToken, tokenExpiresInMs);

		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();
	}
}
