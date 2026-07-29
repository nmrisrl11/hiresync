import { UserRepository } from "@/iam/domain/repositories";
import { SessionId, UserId } from "@/iam/domain/value-objects";
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

		if (!payload.sessionId)
			throw new InvalidTokenException("Malformed token: Missing session context.");

		//! Fetch the aggregate root
		const userIdVo = new UserId(payload.sub);
		const user = await this.userRepository.findById(userIdVo);
		if (!user) throw new InvalidLoginException("User no longer exists.");

		//! Verify the session context
		const sessionIdVo = new SessionId(payload.sessionId);
		const session = user.getSessions().find((s) => s.id.equals(sessionIdVo));
		if (!session || !session.isValid())
			throw new InvalidTokenException("Session is invalid, expired, or revoked.");

		//! Compare the raw token from the cookie against the database hash
		const isMatch = await this.hashService.compare(command.token, session.getRefreshTokenHash());
		if (!isMatch) {
			//! Token reuse attack detected
			user.revokeAllSessions();
			await this.userRepository.save(user);
			throw new InvalidTokenException(
				"Security alert: Token reuse detected. All sessions revoked.",
			);
		}

		//! Generate a brand new set of tokens (Session Rotation)
		const tokens = await this.jwtService.generateTokens({
			sub: user.id.getValue(),
			email: user.email.getValue(),
			role: user.role.code.getValue(),
			sessionId: session.id.getValue(),
		});

		//! Hash the new refresh token
		const newRefreshTokenHash = await this.hashService.hash(tokens.refreshToken, 10);

		//! Rotate the session token
		session.rotateToken(newRefreshTokenHash);

		await this.userRepository.save(user);

		return {
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
		};
	}
}
