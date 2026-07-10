import { Injectable } from "@nestjs/common";
import { LoginCommand, LoginResult, LoginUseCasePort } from "../ports/inbound/login.in-port";
import { IamRepositoryPort } from "../ports/outbound/iam.repository.port";
import { JwtServicePort } from "../ports/outbound/jwt.service.port";
import { HashServicePort } from "../ports/outbound/hash.service.port";
import { InvalidLoginException } from "../exceptions/application.exception";
import { Email } from "@/iam/domain/value-objects";

@Injectable()
export class LoginUseCase implements LoginUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly jwtService: JwtServicePort,
		private readonly hashService: HashServicePort,
	) {}

	public async execute(command: LoginCommand): Promise<LoginResult> {
		const emailVo = new Email(command.email);

		const user = await this.iamRepository.findByEmail(emailVo);

		if (!user || !user.account) throw new InvalidLoginException("Invalid email or password.");

		const passwordMatch = await this.hashService.compare(
			command.password,
			user.account?.getPasswordHash(),
		);

		if (!passwordMatch) throw new InvalidLoginException("Invalid email or password.");

		if (!user.isVerified)
			throw new InvalidLoginException("Please verify your email address before logging in.");

		const tokens = await this.jwtService.generateTokens({
			sub: user.id,
			email: user.email.getValue(),
			role: user.role.code,
		});

		const refreshTokenHash = await this.hashService.hash(tokens.refreshToken, 10);
		user.account.updateRefreshTokenHash(refreshTokenHash);

		await this.iamRepository.save(user);

		return {
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
