import { Injectable } from "@nestjs/common";
import {
	HashServicePort,
	IamRepositoryPort,
	JwtPayload,
	JwtServicePort,
} from "../../ports/outbound";
import { InvalidLoginException, InvalidTokenException } from "../../exceptions";
import {
	RefreshTokenCommand,
	RefreshTokenResult,
	RefreshTokenUseCasePort,
} from "../../ports/inbound/authentication";

@Injectable()
export class RefreshTokenUseCase implements RefreshTokenUseCasePort {
	constructor(
		private readonly jwtService: JwtServicePort,
		private readonly iamRepository: IamRepositoryPort,
		private readonly hashService: HashServicePort,
	) {}

	public async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
		let payload: JwtPayload;

		//! Verify the cryptographic signature of the refresh token
		try {
			payload = await this.jwtService.verifyRefreshToken(command.token);
		} catch {
			throw new InvalidTokenException("Invalid or expired refresh token.");
		}

		//! Fetch the aggregate root
		const user = await this.iamRepository.findById(payload.sub);
		if (!user) throw new InvalidLoginException("User no longer exists.");

		//! Read the stored hash (safe querying through the root)
		const currentHash = user.account?.getRefreshTokenHash();
		if (!currentHash) throw new InvalidTokenException("Invalid refresh token.");

		//! Compare the raw token from the cookie against the database hash
		const isMatch = await this.hashService.compare(command.token, currentHash);
		if (!isMatch) throw new InvalidTokenException("Invalid refresh token.");

		//! Generate a brand new set of tokens (Session Rotation)
		const tokens = await this.jwtService.generateTokens({
			sub: user.id,
			email: user.email.getValue(),
			role: user.role.code,
		});

		//! Hash the new refresh token
		const newRefreshTokenHash = await this.hashService.hash(tokens.refreshToken, 10);

		//! Update state strictly through the Aggregate Root
		user.updateRefreshToken(newRefreshTokenHash);

		//! Save the mutated aggregate back to the database
		await this.iamRepository.save(user);

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
		};
	}
}
