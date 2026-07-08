import { env } from "@/env";
import {
	InvalidVerificationTokenException,
	RoleNotFoundException,
	UnauthorizedRoleException,
	UserAlreadyExistsException,
} from "@/iam/application/exceptions/application.exception";
import {
	RegisterUserCommand,
	RegisterUserUseCasePort,
} from "@/iam/application/ports/inbound/register-user.in-port";
import {
	VerifyEmailCommand,
	VerifyEmailUseCasePort,
} from "@/iam/application/ports/inbound/verify-email.in-port";
import { InvalidDomainStateException } from "@/iam/domain/exceptions/domain.exception";
import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	ForbiddenException,
	HttpCode,
	HttpStatus,
	Post,
	Res,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import type { StringValue } from "ms";
import ms from "ms";
import { RegisterDto } from "../dtos/register.dto";
import { VerifyEmailDto } from "../dtos/verify-email.dto";
import { AuthResponseMapper } from "../mappers/auth-response.mapper";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
	constructor(
		private readonly registerUserUseCase: RegisterUserUseCasePort,
		private readonly verifyEmailUseCase: VerifyEmailUseCasePort,
	) {}

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

	@Post("verify-email")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Verify email address and auto login." })
	public async verifyEmail(@Body() dto: VerifyEmailDto, @Res({ passthrough: true }) res: Response) {
		try {
			const command = new VerifyEmailCommand(dto.token);
			const result = await this.verifyEmailUseCase.execute(command);
			const isProduction = env.NODE_ENV === "production";
			const refreshCookieMaxAge = ms(env.JWT_ACCESS_EXPIRES_IN as StringValue);

			res.cookie("refresh_token", result.refreshToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: "lax",
				maxAge: refreshCookieMaxAge,
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
		}
	}
}
