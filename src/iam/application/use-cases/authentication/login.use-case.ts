import { Injectable } from "@nestjs/common";
import { Email } from "@/iam/domain/value-objects";
import { InvalidLoginException } from "../../exceptions";
import { HashServicePort, IamRepositoryPort, JwtServicePort } from "../../ports/outbound";
import { LoginCommand, LoginResult, LoginUseCasePort } from "../../ports/inbound/authentication";

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

		if (!user || !user.account) throw new InvalidLoginException();

		const passwordMatch = await this.hashService.compare(
			command.password,
			user.account?.getPasswordHash(),
		);

		if (!passwordMatch) throw new InvalidLoginException();

		if (!user.isVerified)
			throw new InvalidLoginException("Please verify your email address before logging in.");

		const tokens = await this.jwtService.generateTokens({
			sub: user.id,
			email: user.email.getValue(),
			role: user.role.code,
		});

		const refreshTokenHash = await this.hashService.hash(tokens.refreshToken, 10);
		user.updateRefreshToken(refreshTokenHash);

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
