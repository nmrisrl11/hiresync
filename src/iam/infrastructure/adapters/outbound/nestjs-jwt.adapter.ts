import { env } from "@/env";
import {
	GeneratedTokens,
	JwtPayload,
	JwtServicePort,
} from "@/iam/application/ports/outbound/jwt.service.port";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { StringValue } from "ms";

@Injectable()
export class NestjsJwtAdapter implements JwtServicePort {
	constructor(private readonly jwtService: JwtService) {}

	public async generateTokens(payload: JwtPayload): Promise<GeneratedTokens> {
		const accessToken = await this.jwtService.signAsync(payload, {
			secret: env.JWT_ACCESS_SECRET,
			expiresIn: env.JWT_ACCESS_EXPIRES_IN as StringValue,
		});

		const refreshToken = await this.jwtService.signAsync(payload, {
			secret: env.JWT_REFRESH_SECRET,
			expiresIn: env.JWT_REFRESH_EXPIRES_IN as StringValue,
		});

		return { accessToken, refreshToken };
	}
}
