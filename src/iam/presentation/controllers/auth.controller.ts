import {
	RegisterUserCommand,
	RegisterUserUseCasePort,
} from "@/iam/application/ports/inbound/register-user.in-port";
import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
} from "@nestjs/common";
import { RegisterDto } from "../dtos/register.dto";
import { AuthResponseMapper } from "../mappers/auth-response.mapper";
import {
	RoleNotFoundException,
	UserAlreadyExistsException,
} from "@/iam/application/exceptions/application.exception";
import { InvalidDomainStateException } from "@/iam/domain/exceptions/domain.exception";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
	constructor(private readonly registerUserUseCase: RegisterUserUseCasePort) {}

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
			throw error;
		}
	}
}
