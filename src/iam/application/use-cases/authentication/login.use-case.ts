import { UserRepository } from "@/iam/domain/repositories";
import { Email } from "@/iam/domain/value-objects";
import { Injectable } from "@nestjs/common";
import { InvalidLoginException } from "../../exceptions";
import { LoginCommand, LoginResult, LoginUseCasePort } from "../../ports/inbound/authentication";
import { HashServicePort, JwtServicePort } from "../../ports/outbound";

@Injectable()
export class LoginUseCase implements LoginUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtServicePort,
		private readonly hashService: HashServicePort,
	) {}

	public async execute(command: LoginCommand): Promise<LoginResult> {
		const emailVo = new Email(command.email);

		const user = await this.userRepository.findByEmail(emailVo);

		if (!user || !user.account) throw new InvalidLoginException();

		const passwordMatch = await this.hashService.compare(
			command.password,
			user.account?.getPasswordHash(),
		);

		if (!passwordMatch) throw new InvalidLoginException();

		if (!user.isVerified)
			throw new InvalidLoginException("Please verify your email address before logging in.");

		const tokens = await this.jwtService.generateTokens({
			sub: user.id.getValue(),
			email: user.email.getValue(),
			role: user.role.code.getValue(),
		});

		const refreshTokenHash = await this.hashService.hash(tokens.refreshToken, 10);
		user.updateRefreshToken(refreshTokenHash);

		await this.userRepository.save(user);

		return {
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
