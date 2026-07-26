import { UserRepository } from "@/iam/domain/repositories";
import { DomainEventPublisherPort } from "@/shared/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import { InvalidTokenException } from "../../exceptions";
import {
	VerifyEmailCommand,
	VerifyEmailResult,
	VerifyEmailUseCasePort,
} from "../../ports/inbound/authentication";
import { HashServicePort, JwtServicePort } from "../../ports/outbound";

@Injectable()
export class VerifyEmailUseCase implements VerifyEmailUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtServicePort,
		private readonly hashService: HashServicePort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: VerifyEmailCommand): Promise<VerifyEmailResult> {
		const user = await this.userRepository.findByVerificationToken(command.token);

		if (!user) throw new InvalidTokenException("Verification token not found or invalid.");

		user.verifyEmail(command.token);

		const tokens = await this.jwtService.generateTokens({
			sub: user.id.getValue(),
			email: user.email.getValue(),
			role: user.role.code.getValue(),
		});

		const refreshTokenHash = await this.hashService.hash(tokens.refreshToken, 10);
		user.updateRefreshToken(refreshTokenHash);

		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();

		return {
			message: "Email verified successfully.",
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			user: {
				id: user.id.getValue(),
				email: user.email.getValue(),
				name: user.name,
				role: user.role.code.getValue(),
			},
		};
	}
}
