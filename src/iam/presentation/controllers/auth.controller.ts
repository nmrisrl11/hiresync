import { env } from "@/env";
import {
	RestoreAccountCommand,
	RestoreAccountUseCasePort,
} from "@/iam/application/ports/inbound/account";
import {
	ForgotPasswordCommand,
	ForgotPasswordUseCasePort,
	LoginCommand,
	LoginUseCasePort,
	LogoutCommand,
	LogoutUseCasePort,
	MfaLoginCommand,
	MfaLoginUseCasePort,
	RefreshTokenCommand,
	RefreshTokenUseCasePort,
	RegisterUserCommand,
	RegisterUserUseCasePort,
	ResendVerificationCommand,
	ResendVerificationUseCasePort,
	ResetPasswordCommand,
	ResetPasswordUseCasePort,
	VerifyEmailCommand,
	VerifyEmailUseCasePort,
} from "@/iam/application/ports/inbound/authentication";
import { CurrentUser, Public } from "@/shared/http/decorators";
import { type JwtPayload } from "@/shared/types";
import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Ip,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseFilters,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import type { StringValue } from "ms";
import ms from "ms";
import {
	ForgotPasswordDto,
	LoginDto,
	MfaLoginDto,
	RegisterDto,
	ResendVerificationDto,
	ResetPasswordDto,
	RestoreAccountDto,
	VerifyEmailDto,
} from "../dtos/authentication";
import { IamExceptionFilter } from "../filters/iam-exception.filter";
import { ResponseMapper } from "../mappers/response.mapper";

@UseFilters(IamExceptionFilter)
@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
	constructor(
		private readonly registerUserUseCase: RegisterUserUseCasePort,
		private readonly verifyEmailUseCase: VerifyEmailUseCasePort,
		private readonly loginUseCase: LoginUseCasePort,
		private readonly logoutUseCase: LogoutUseCasePort,
		private readonly forgotPasswordUseCase: ForgotPasswordUseCasePort,
		private readonly resetPasswordUseCase: ResetPasswordUseCasePort,
		private readonly resendVerificationUseCase: ResendVerificationUseCasePort,
		private readonly refreshTokenUseCase: RefreshTokenUseCasePort,
		private readonly restoreAccountUseCase: RestoreAccountUseCasePort,
		private readonly mfaLoginUseCase: MfaLoginUseCasePort,
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
	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Register a new user." })
	public async register(@Body() dto: RegisterDto) {
		const command = new RegisterUserCommand(dto.email, dto.name, dto.password, dto.roleCode);

		await this.registerUserUseCase.execute(command);

		return ResponseMapper.toRegistrationMessage();
	}

	@Public()
	@Post("verify-email")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Verify email address and auto login." })
	public async verifyEmail(
		@Body() dto: VerifyEmailDto,
		@Ip() ipAddress: string,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const userAgent = req.headers["user-agent"] || "Unknown Device";
		const command = new VerifyEmailCommand(dto.token, userAgent, ipAddress);
		const result = await this.verifyEmailUseCase.execute(command);

		this.setRefreshTokenCookie(res, result.refreshToken);

		return {
			message: result.message,
			accessToken: result.accessToken,
			user: result.user,
		};
	}

	@Public()
	@Post("login")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({
		summary: "Login with credentials. Returns MFA challenge token if 2FA is enabled.",
	})
	public async login(
		@Body() dto: LoginDto,
		@Ip() ipAddress: string,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const userAgent = req.headers["user-agent"] || "Unknown Device";
		const command = new LoginCommand(dto.email, dto.password, userAgent, ipAddress);
		const result = await this.loginUseCase.execute(command);

		//! If MFA is enabled, do NOT set the refresh cookie. Return the challenge token.
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

	@Public()
	@Post("login/mfa")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({
		summary: "Verify MFA code or recovery backup code and complete authentication.",
	})
	public async loginMfa(
		@Body() dto: MfaLoginDto,
		@Ip() ipAddress: string,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const userAgent = req.headers["user-agent"] || "Unknown Device";
		const command = new MfaLoginCommand(dto.mfaChallengeToken, dto.code, userAgent, ipAddress);

		const result = await this.mfaLoginUseCase.execute(command);

		this.setRefreshTokenCookie(res, result.refreshToken);

		return {
			accessToken: result.accessToken,
			user: result.user,
		};
	}

	@Post("logout")
	@HttpCode(HttpStatus.OK)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Logout and invalidate refresh token." })
	public async logout(
		@CurrentUser() userPayload: JwtPayload,
		@Res({ passthrough: true }) res: Response,
	) {
		const command = new LogoutCommand(userPayload.sub, userPayload.sessionId);

		await this.logoutUseCase.execute(command);

		res.clearCookie("refresh_token");

		return { message: "Logged out successfully." };
	}

	@Public()
	@Post("refresh")
	@HttpCode(HttpStatus.OK)
	@ApiCookieAuth()
	@Throttle({ default: { ttl: 60000, limit: 10 } })
	@ApiOperation({ summary: "Refresh access token using the refresh token cookie." })
	public async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const cookies = req.cookies as Record<string, string>;
		const refreshToken = cookies?.refresh_token;

		if (!refreshToken) throw new UnauthorizedException("No refresh token provided.");

		const command = new RefreshTokenCommand(refreshToken);

		const result = await this.refreshTokenUseCase.execute(command);

		this.setRefreshTokenCookie(res, result.refreshToken);

		return { accessToken: result.accessToken };
	}

	@Public()
	@Post("forgot-password")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 3 } })
	@ApiOperation({ summary: "Request a password reset email." })
	public async forgotPassword(@Body() dto: ForgotPasswordDto) {
		const command = new ForgotPasswordCommand(dto.email);
		return await this.forgotPasswordUseCase.execute(command);
	}

	@Throttle({ default: { ttl: 60000, limit: 3 } })
	@Public()
	@Post("reset-password")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Reset password using token from email." })
	public async resetPassword(@Body() dto: ResetPasswordDto) {
		const command = new ResetPasswordCommand(dto.token, dto.newPassword);

		return await this.resetPasswordUseCase.execute(command);
	}

	@Throttle({ default: { ttl: 60000, limit: 3 } })
	@Public()
	@Post("resend-verification")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Resend the verification email." })
	public async resendVerification(@Body() dto: ResendVerificationDto) {
		const command = new ResendVerificationCommand(dto.email);
		return await this.resendVerificationUseCase.execute(command);
	}

	@Public()
	@Post("account/restore")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Cancel a scheduled deletion and restore the account." })
	public async restoreAccount(
		@Body() dto: RestoreAccountDto,
		@Ip() ipAddress: string,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const userAgent = req.headers["user-agent"] || "Unknown Device";
		const command = new RestoreAccountCommand(dto.email, dto.password, userAgent, ipAddress);
		const result = await this.restoreAccountUseCase.execute(command);

		this.setRefreshTokenCookie(res, result.refreshToken);

		return {
			message: "Account successfully restored.",
			accessToken: result.accessToken,
		};
	}
}
