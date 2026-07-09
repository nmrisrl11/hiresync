import { env } from "@/env";
import {
	InvalidLoginException,
	InvalidVerificationTokenException,
	RoleNotFoundException,
	UnauthorizedRoleException,
	UserAlreadyExistsException,
	UserNotFoundException,
} from "@/iam/application/exceptions/application.exception";
import { LoginCommand, LoginUseCasePort } from "@/iam/application/ports/inbound/login.in-port";
import { LogoutCommand, LogoutUseCasePort } from "@/iam/application/ports/inbound/logout.in-port";
import {
	RegisterUserCommand,
	RegisterUserUseCasePort,
} from "@/iam/application/ports/inbound/register-user.in-port";
import {
	VerifyEmailCommand,
	VerifyEmailUseCasePort,
} from "@/iam/application/ports/inbound/verify-email.in-port";
import type { JwtPayload } from "@/iam/application/ports/outbound/jwt.service.port";
import { InvalidDomainStateException } from "@/iam/domain/exceptions/domain.exception";
import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	ForbiddenException,
	HttpCode,
	HttpStatus,
	NotFoundException,
	Post,
	Res,
	UnauthorizedException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import type { StringValue } from "ms";
import ms from "ms";
import { CurrentUser } from "../decorators/current-user.decorator";
import { LoginDto } from "../dtos/login.dto";
import { RegisterDto } from "../dtos/register.dto";
import { VerifyEmailDto } from "../dtos/verify-email.dto";
import { AuthResponseMapper } from "../mappers/auth-response.mapper";
import { Public } from "../decorators/public.decorator";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
	constructor(
		private readonly registerUserUseCase: RegisterUserUseCasePort,
		private readonly verifyEmailUseCase: VerifyEmailUseCasePort,
		private readonly loginUseCase: LoginUseCasePort,
		private readonly logoutUseCase: LogoutUseCasePort,
	) {}

	private readonly jwtAccessSecret = env.JWT_ACCESS_SECRET;
	private readonly jwtAccessExpiresIn = env.JWT_ACCESS_EXPIRES_IN as StringValue;
	private readonly jwtRefreshSecret = env.JWT_REFRESH_SECRET;
	private readonly jwtRefreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN as StringValue;
	private readonly refreshCookieMaxAge = ms(this.jwtRefreshExpiresIn);
	private readonly isProduction = env.NODE_ENV === "production";

	@Public()
	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Register a new user." })
	public async register(@Body() dto: RegisterDto) {
		try {
			const command = new RegisterUserCommand(dto.email, dto.name, dto.password, dto.roleCode);

			const result = await this.registerUserUseCase.execute(command);

			return AuthResponseMapper.toRegistrationMessage(result.isEmailQueued);
		} catch (error: unknown) {
			if (error instanceof UserAlreadyExistsException) {
				throw new ConflictException(error.message);
			}
			if (error instanceof RoleNotFoundException || error instanceof InvalidDomainStateException) {
				throw new BadRequestException(error.message);
			}

			if (error instanceof UnauthorizedRoleException) throw new ForbiddenException(error.message);

			throw error;
		}
	}

	@Public()
	@Post("verify-email")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Verify email address and auto login." })
	public async verifyEmail(@Body() dto: VerifyEmailDto, @Res({ passthrough: true }) res: Response) {
		try {
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
		} catch (error: unknown) {
			if (
				error instanceof InvalidVerificationTokenException ||
				error instanceof InvalidDomainStateException
			)
				throw new BadRequestException(error.message);

			throw error;
		}
	}

	@Public()
	@Post("login")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Login and receive access and refresh tokens." })
	public async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
		try {
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
		} catch (error: unknown) {
			if (error instanceof InvalidLoginException) throw new UnauthorizedException(error.message);

			throw error;
		}
	}

	@Post("logout")
	@HttpCode(HttpStatus.OK)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Logout and invalidate refresh token." })
	public async logout(
		@CurrentUser() userPayload: JwtPayload,
		@Res({ passthrough: true }) res: Response,
	) {
		try {
			const command = new LogoutCommand(userPayload.sub);

			await this.logoutUseCase.execute(command);

			res.clearCookie("refresh_token");

			return { message: "Logged out successfully." };
		} catch (error: unknown) {
			if (error instanceof UserNotFoundException) throw new NotFoundException(error.message);

			throw error;
		}
	}
}
