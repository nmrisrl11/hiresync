import { env } from "@/env";
import {
	LinkOAuthProviderCommand,
	LinkOAuthProviderUseCasePort,
} from "@/iam/application/ports/inbound/account/oauth";
import {
	GetOAuthAuthUrlCommand,
	GetOAuthAuthUrlUseCasePort,
	OAuthCallbackLoginCommand,
	OAuthCallbackLoginUseCasePort,
} from "@/iam/application/ports/inbound/authentication";
import { OAuthProviderType } from "@/iam/domain/types";
import { ApiSuccessResponse, Public } from "@/shared/http/decorators";
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
import { LoginResponseDto, OAuthAuthorizationUrlResponseDto } from "../dtos/authentication";
import { IamExceptionFilter } from "../filters/iam-exception.filter";
import {
	LoginResponseMapper,
	OAuthAuthorizationUrlResponseMapper,
} from "../mappers/authentication";

@UseFilters(IamExceptionFilter)
@ApiTags("Authentication - OAuth")
@Controller("auth/oauth")
export class OAuthController {
	constructor(
		private readonly getOAuthAuthUrlUseCase: GetOAuthAuthUrlUseCasePort,
		private readonly oauthCallbackLoginUseCase: OAuthCallbackLoginUseCasePort,
		private readonly linkOAuthProviderUseCase: LinkOAuthProviderUseCasePort,
	) {}

	private readonly refreshCookieMaxAge = ms(env.JWT_REFRESH_EXPIRES_IN as StringValue);
	private readonly isProduction = env.NODE_ENV === "production";

	private setRefreshTokenCookie(res: Response, token: string, path: string = "/api/auth"): void {
		res.cookie("refresh_token", token, {
			httpOnly: true,
			secure: this.isProduction,
			sameSite: "lax",
			maxAge: this.refreshCookieMaxAge,
			path,
		});
	}

	@Public()
	@Get(":provider/url")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 10 } })
	@ApiOperation({ summary: "Generate the secure redirect URL for the requested OAuth provider." })
	@ApiSuccessResponse(
		OAuthAuthorizationUrlResponseDto,
		HttpStatus.OK,
		"OAuth authorization URL generated successfully.",
	)
	public async getAuthorizationUrl(
		@Param("provider") providerParam: string,
	): Promise<OAuthAuthorizationUrlResponseDto> {
		const provider = providerParam.toUpperCase() as OAuthProviderType;
		const command = new GetOAuthAuthUrlCommand(provider);
		const result = await this.getOAuthAuthUrlUseCase.execute(command);

		return OAuthAuthorizationUrlResponseMapper.toDto(result);
	}

	@Public()
	@Get(":provider/callback")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 10 } })
	@ApiOperation({
		summary: "Handle provider callback, exchange code, and log the user in or link account.",
	})
	@ApiSuccessResponse(LoginResponseDto, HttpStatus.OK, "OAuth callback processed successfully.")
	public async handleCallback(
		@Param("provider") providerParam: string,
		@Query("code") code: string,
		@Query("state") state: string,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<LoginResponseDto | { message: string }> {
		const provider = providerParam.toUpperCase() as OAuthProviderType;

		const cookies = req.cookies as Record<string, string>;
		const linkIntentUserId = cookies?.oauth_link_intent;

		if (linkIntentUserId) {
			res.clearCookie("oauth_link_intent", { path: "/api/auth/oauth" });

			const linkCommand = new LinkOAuthProviderCommand(linkIntentUserId, provider, code);
			await this.linkOAuthProviderUseCase.execute(linkCommand);

			return { message: `Successfully linked ${provider} to your account.` };
		}

		const ipAddress = req.ip || req.socket.remoteAddress;
		const userAgent = req.headers["user-agent"] || "Unknown Device";

		const command = new OAuthCallbackLoginCommand(provider, code, state, userAgent, ipAddress);
		const result = await this.oauthCallbackLoginUseCase.execute(command);

		//! If MFA is enabled, do NOT set the refresh cookie. Return the challenge token via mapper.
		if (!result.mfaRequired && result.refreshToken) {
			this.setRefreshTokenCookie(res, result.refreshToken);
		}

		return LoginResponseMapper.toDto(result);
	}
}
