import { Injectable } from "@nestjs/common";
import { InvalidVerificationTokenException } from "../exceptions/application.exception";
import {
	VerifyEmailCommand,
	VerifyEmailResult,
	VerifyEmailUseCasePort,
} from "../ports/inbound/verify-email.in-port";
import { HashServicePort } from "../ports/outbound/hash.service.port";
import { IamRepositoryPort } from "../ports/outbound/iam.repository.port";
import { JwtServicePort } from "../ports/outbound/jwt.service.port";

@Injectable()
export class VerifyEmailUseCase implements VerifyEmailUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly jwtService: JwtServicePort,
		private readonly hashService: HashServicePort,
	) {}

	public async execute(command: VerifyEmailCommand): Promise<VerifyEmailResult> {
		const user = await this.iamRepository.findByVerificationToken(command.token);

		if (!user) throw new InvalidVerificationTokenException("Invalid verification token.");

		user.verifyEmail(command.token);

		const tokens = await this.jwtService.generateTokens({
			sub: user.id,
			email: user.email.getValue(),
			role: user.role.code,
		});

		const refreshTokenHash = await this.hashService.hash(tokens.refreshToken, 10);
		user.account?.updateRefreshTokenHash(refreshTokenHash);

		await this.iamRepository.save(user);

		return {
			message: "Email verified successfully.",
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			user: {
				id: user.id,
				email: user.email.getValue(),
				name: user.name,
				role: user.role.code,
			},
		};
	}
}
