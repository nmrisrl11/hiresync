import { env } from "@/env";
import {
	ForgotPasswordCommand,
	ForgotPasswordUseCasePort,
	LoginCommand,
	LoginUseCasePort,
	LogoutCommand,
	LogoutUseCasePort,
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
import { type JwtPayload } from "@/iam/application/ports/outbound";
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
import { CurrentUser } from "../decorators/current-user.decorator";
import { Public } from "../decorators/public.decorator";
import {
	ForgotPasswordDto,
	LoginDto,
	RegisterDto,
	ResendVerificationDto,
	ResetPasswordDto,
	VerifyEmailDto,
} from "../dtos";
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
	) {}

	private readonly refreshCookieMaxAge = ms(env.JWT_REFRESH_EXPIRES_IN as StringValue);
	private readonly isProduction = env.NODE_ENV === "production";

	@Public()
	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Register a new user." })
	public async register(@Body() dto: RegisterDto) {
		const command = new RegisterUserCommand(dto.email, dto.name, dto.password, dto.roleCode);

		const result = await this.registerUserUseCase.execute(command);

		return ResponseMapper.toRegistrationMessage(result.verificationEmailEnqueued);
	}

	@Public()
	@Post("verify-email")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Verify email address and auto login." })
	public async verifyEmail(@Body() dto: VerifyEmailDto, @Res({ passthrough: true }) res: Response) {
		const command = new VerifyEmailCommand(dto.token);
		const result = await this.verifyEmailUseCase.execute(command);

		res.cookie("refresh_token", result.refreshToken, {
			httpOnly: true,
			secure: this.isProduction,
			sameSite: "lax",
			maxAge: this.refreshCookieMaxAge,
		});

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
	@ApiOperation({ summary: "Login and receive access and refresh tokens." })
	public async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
		const command = new LoginCommand(dto.email, dto.password);
		const result = await this.loginUseCase.execute(command);

		res.cookie("refresh_token", result.refreshToken, {
			httpOnly: true,
			secure: this.isProduction,
			sameSite: "lax",
			maxAge: this.refreshCookieMaxAge,
		});

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
		const command = new LogoutCommand(userPayload.sub);

		await this.logoutUseCase.execute(command);

		res.clearCookie("refresh_token");

		return { message: "Logged out successfully." };
	}

	@Public()
	@Post("refresh")
	@HttpCode(HttpStatus.OK)
	@ApiCookieAuth()
	@ApiOperation({ summary: "Refresh access token using the refresh token cookie." })
	public async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const cookies = req.cookies as Record<string, string>;
		const refreshToken = cookies?.refresh_token;

		if (!refreshToken) throw new UnauthorizedException("No refresh token provided.");

		const command = new RefreshTokenCommand(refreshToken);

		const result = await this.refreshTokenUseCase.execute(command);

		res.cookie("refresh_token", result.refreshToken, {
			httpOnly: true,
			secure: this.isProduction,
			sameSite: "lax",
			maxAge: this.refreshCookieMaxAge,
		});

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
}
