import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { JwtPayload } from "@/shared/types";
import { Injectable } from "@nestjs/common";
import { InvalidLoginException, InvalidTokenException } from "../../exceptions";
import {
	RefreshTokenCommand,
	RefreshTokenResult,
	RefreshTokenUseCasePort,
} from "../../ports/inbound/authentication";
import { HashServicePort, JwtServicePort } from "../../ports/outbound";

@Injectable()
export class RefreshTokenUseCase implements RefreshTokenUseCasePort {
	constructor(
		private readonly jwtService: JwtServicePort,
		private readonly userRepository: UserRepository,
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
		const userIdVo = new UserId(payload.sub);
		const user = await this.userRepository.findById(userIdVo);
		if (!user) throw new InvalidLoginException("User no longer exists.");

		//! Read the stored hash (safe querying through the root)
		const currentHash = user.account?.getRefreshTokenHash();
		if (!currentHash) throw new InvalidTokenException("Invalid refresh token.");

		//! Compare the raw token from the cookie against the database hash
		const isMatch = await this.hashService.compare(command.token, currentHash);
		if (!isMatch) throw new InvalidTokenException("Invalid refresh token.");

		//! Generate a brand new set of tokens (Session Rotation)
		const tokens = await this.jwtService.generateTokens({
			sub: user.id.getValue(),
			email: user.email.getValue(),
			role: user.role.code.getValue(),
		});

		//! Hash the new refresh token
		const newRefreshTokenHash = await this.hashService.hash(tokens.refreshToken, 10);

		//! Update state strictly through the Aggregate Root
		user.updateRefreshToken(newRefreshTokenHash);

		//! Save the mutated aggregate back to the database
		await this.userRepository.save(user);

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
		};
	}
}
