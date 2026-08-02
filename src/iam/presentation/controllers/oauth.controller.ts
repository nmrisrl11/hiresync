import { env } from "@/env";
import {
	GetOAuthAuthUrlCommand,
	GetOAuthAuthUrlUseCasePort,
	OAuthCallbackLoginCommand,
	OAuthCallbackLoginUseCasePort,
} from "@/iam/application/ports/inbound/authentication";
import { OAuthProviderType } from "@/iam/domain/types";
import { Public } from "@/shared/http/decorators";
import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Query,
	Req,
	Res,
	UseFilters,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import type { StringValue } from "ms";
import ms from "ms";
import { IamExceptionFilter } from "../filters/iam-exception.filter";

@UseFilters(IamExceptionFilter)
@ApiTags("Authentication - OAuth")
@Controller("auth/oauth")
export class OAuthController {
	constructor(
		private readonly getOAuthAuthUrlUseCase: GetOAuthAuthUrlUseCasePort,
		private readonly oauthCallbackLoginUseCase: OAuthCallbackLoginUseCasePort,
	) {}

	private readonly refreshCookieMaxAge = ms(env.JWT_REFRESH_EXPIRES_IN as StringValue);
	private readonly isProduction = env.NODE_ENV === "production";

	private setRefreshTokenCookie(res: Response, token: string): void {
		res.cookie("refresh_token", token, {
			httpOnly: true,
			secure: this.isProduction,
			sameSite: "lax",
			maxAge: this.refreshCookieMaxAge,
		});
	}

	@Public()
	@Get(":provider/url")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 10 } })
	@ApiOperation({ summary: "Generate the secure redirect URL for the requested OAuth provider." })
	public async getAuthorizationUrl(@Param("provider") providerParam: string) {
		const provider = providerParam.toUpperCase() as OAuthProviderType;
		const command = new GetOAuthAuthUrlCommand(provider);
		const result = await this.getOAuthAuthUrlUseCase.execute(command);

		return {
			message: "OAuth authorization URL generated successfully.",
			data: result,
		};
	}

	@Public()
	@Get(":provider/callback")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 10 } })
	@ApiOperation({ summary: "Handle provider callback, exchange code, and log the user in." })
	public async handleCallback(
		@Param("provider") providerParam: string,
		@Query("code") code: string,
		@Query("state") state: string,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const provider = providerParam.toUpperCase() as OAuthProviderType;
		const userAgent = req.headers["user-agent"] || "Unknown Device";
		const ipAddress = req.ip;

		const command = new OAuthCallbackLoginCommand(provider, code, state, userAgent, ipAddress);

		const result = await this.oauthCallbackLoginUseCase.execute(command);

		if (result.mfaRequired) {
			return {
				mfaRequired: true,
				mfaChallengeToken: result.mfaChallengeToken,
			};
		}

		this.setRefreshTokenCookie(res, result.refreshToken!);

		return {
			accessToken: result.accessToken,
			user: result.user,
		};
	}
}
