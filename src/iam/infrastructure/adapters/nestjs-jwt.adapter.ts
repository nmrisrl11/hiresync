import { env } from "@/env";
import { JwtServicePort, JwtTokens, MfaChallengePayload } from "@/iam/application/ports/outbound";
import { JwtPayload } from "@/shared/types";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { StringValue } from "ms";

@Injectable()
export class NestjsJwtAdapter implements JwtServicePort {
	constructor(private readonly jwtService: JwtService) {}

	public async generateTokens(payload: JwtPayload): Promise<JwtTokens> {
		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: env.JWT_ACCESS_SECRET,
				expiresIn: env.JWT_ACCESS_EXPIRES_IN as StringValue,
			}),

			this.jwtService.signAsync(payload, {
				secret: env.JWT_REFRESH_SECRET,
				expiresIn: env.JWT_REFRESH_EXPIRES_IN as StringValue,
			}),
		]);

		return { accessToken, refreshToken };
	}

	public async verifyRefreshToken(token: string): Promise<JwtPayload> {
		return await this.jwtService.verifyAsync<JwtPayload>(token, {
			secret: env.JWT_REFRESH_SECRET,
		});
	}

	public async signMfaChallengeToken(payload: MfaChallengePayload): Promise<string> {
		return await this.jwtService.signAsync(payload, {
			secret: env.JWT_ACCESS_SECRET,
			expiresIn: env.MFA_CHALLENGE_TOKEN_EXPIRES_IN as StringValue,
		});
	}

	public async verifyMfaChallengeToken(token: string): Promise<MfaChallengePayload> {
		return await this.jwtService.verifyAsync<MfaChallengePayload>(token, {
			secret: env.JWT_ACCESS_SECRET,
		});
	}
}
