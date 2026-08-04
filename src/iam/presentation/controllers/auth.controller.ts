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
import {
	ApiMessageResponse,
	ApiSuccessResponse,
	CurrentUser,
	Public,
} from "@/shared/http/decorators";
import { type JwtPayload } from "@/shared/types";
import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
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
	ForgotPasswordRequestDto,
	LoginRequestDto,
	LoginResponseDto,
	MfaLoginRequestDto,
	RefreshResponseDto,
	RegisterRequestDto,
	ResendVerificationRequestDto,
	ResetPasswordRequestDto,
	RestoreAccountRequestDto,
	VerifyEmailRequestDto,
	VerifyEmailResponseDto,
} from "../dtos/authentication";
import { IamExceptionFilter } from "../filters/iam-exception.filter";
import {
	LoginResponseMapper,
	MfaLoginResponseMapper,
	RefreshResponseMapper,
	VerifyEmailResponseMapper,
} from "../mappers/authentication";

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
	@Post("register")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Register a new user." })
	@ApiMessageResponse(
		HttpStatus.OK,
		"Registration successful. Please check your email to verify your account. If you do not receive it within a few minutes, you can use the resend verification option.",
	)
	public async register(@Body() dto: RegisterRequestDto) {
		const command = new RegisterUserCommand(dto.email, dto.name, dto.password, dto.roleCode);
		await this.registerUserUseCase.execute(command);
		return {
			message:
				"Registration successful. Please check your email to verify your account. If you do not receive it within a few minutes, you can use the resend verification option.",
		};
	}

	@Public()
	@Post("verify-email")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Verify email address and auto login." })
	@ApiSuccessResponse(VerifyEmailResponseDto, HttpStatus.OK, "Email verified successfully.")
	public async verifyEmail(
		@Body() dto: VerifyEmailRequestDto,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<VerifyEmailResponseDto> {
		const ipAddress = req.ip || req.socket.remoteAddress || "Unknown IP Address";
		const userAgent = req.headers["user-agent"] || "Unknown Device";

		const command = new VerifyEmailCommand(dto.token, userAgent, ipAddress);
		const result = await this.verifyEmailUseCase.execute(command);

		this.setRefreshTokenCookie(res, result.refreshToken);

		return VerifyEmailResponseMapper.toDto(result);
	}

	@Public()
	@Post("login")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({
		summary: "Login with credentials. Returns MFA challenge token if 2FA is enabled.",
	})
	@ApiSuccessResponse(LoginResponseDto, HttpStatus.OK, "Login successful.")
	public async login(
		@Body() dto: LoginRequestDto,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<LoginResponseDto> {
		const ipAddress = req.ip || req.socket.remoteAddress || "Unknown IP Address";
		const userAgent = req.headers["user-agent"] || "Unknown Device";

		const command = new LoginCommand(dto.email, dto.password, userAgent, ipAddress);
		const result = await this.loginUseCase.execute(command);

		//! If MFA is not required and a refresh token is available, set the refresh cookie.
		if (!result.mfaRequired && result.refreshToken) {
			this.setRefreshTokenCookie(res, result.refreshToken);
		}

		return LoginResponseMapper.toDto(result);
	}

	@Public()
	@Post("login/mfa")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({
		summary: "Complete multi-factor authentication login using a TOTP code.",
	})
	@ApiSuccessResponse(LoginResponseDto, HttpStatus.OK, "MFA Login successful.")
	public async loginMfa(
		@Body() dto: MfaLoginRequestDto,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<LoginResponseDto> {
		const ipAddress = req.ip || req.socket.remoteAddress || "Unknown IP Address";
		const userAgent = req.headers["user-agent"] || "Unknown Device";

		const command = new MfaLoginCommand(dto.mfaChallengeToken, dto.code, userAgent, ipAddress);
		const result = await this.mfaLoginUseCase.execute(command);

		this.setRefreshTokenCookie(res, result.refreshToken);

		return MfaLoginResponseMapper.toDto(result);
	}

	@Post("logout")
	@HttpCode(HttpStatus.OK)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Logout and invalidate refresh token." })
	@ApiMessageResponse(HttpStatus.OK, "Logged out successfully.")
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
	@ApiSuccessResponse(RefreshResponseDto, HttpStatus.OK, "Token refreshed successfully.")
	public async refresh(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<RefreshResponseDto> {
		const cookies = req.cookies as Record<string, string>;
		const refreshToken = cookies?.refresh_token;

		if (!refreshToken) throw new UnauthorizedException("No refresh token provided.");

		const command = new RefreshTokenCommand(refreshToken);

		const result = await this.refreshTokenUseCase.execute(command);

		this.setRefreshTokenCookie(res, result.refreshToken);

		return RefreshResponseMapper.toDto(result);
	}

	@Public()
	@Post("forgot-password")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 3 } })
	@ApiOperation({ summary: "Request a password reset email." })
	@ApiMessageResponse(
		HttpStatus.OK,
		"If account with that email exists, a reset link has been sent.",
	)
	public async forgotPassword(@Body() dto: ForgotPasswordRequestDto) {
		const command = new ForgotPasswordCommand(dto.email);
		return await this.forgotPasswordUseCase.execute(command);
	}

	@Throttle({ default: { ttl: 60000, limit: 3 } })
	@Public()
	@Post("reset-password")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Reset password using token from email." })
	@ApiMessageResponse(HttpStatus.OK, "Password reset successful. You can now login.")
	public async resetPassword(@Body() dto: ResetPasswordRequestDto) {
		const command = new ResetPasswordCommand(dto.token, dto.newPassword);

		return await this.resetPasswordUseCase.execute(command);
	}

	@Throttle({ default: { ttl: 60000, limit: 3 } })
	@Public()
	@Post("resend-verification")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Resend the verification email." })
	@ApiMessageResponse(HttpStatus.OK, "A new verification email has been sent.")
	public async resendVerification(@Body() dto: ResendVerificationRequestDto) {
		const command = new ResendVerificationCommand(dto.email);
		return await this.resendVerificationUseCase.execute(command);
	}

	@Public()
	@Post("account/restore")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Cancel a scheduled deletion and restore the account." })
	@ApiSuccessResponse(RefreshResponseDto, HttpStatus.OK, "Account successfully restored.")
	public async restoreAccount(
		@Body() dto: RestoreAccountRequestDto,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const ipAddress = req.ip || req.socket.remoteAddress || "Unknown IP Address";
		const userAgent = req.headers["user-agent"] || "Unknown Device";

		const command = new RestoreAccountCommand(dto.email, dto.password, userAgent, ipAddress);
		const result = await this.restoreAccountUseCase.execute(command);

		this.setRefreshTokenCookie(res, result.refreshToken);

		return { message: "Account successfully restored.", accessToken: result.accessToken };
	}
}
