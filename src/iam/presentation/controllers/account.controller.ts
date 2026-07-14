import { type JwtPayload } from "@/iam/application/ports/outbound";
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	UseFilters,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../decorators/current-user.decorator";
import {
	ChangePasswordCommand,
	ChangePasswordUseCasePort,
	ConfirmEmailChangeCommand,
	ConfirmEmailChangeUseCasePort,
	DeleteAccountCommand,
	DeleteAccountUseCasePort,
	GetUserByIdQuery,
	GetUserByIdUseCasePort,
	RequestEmailChangeCommand,
	RequestEmailChangeUseCasePort,
	UpdateAccountCommand,
	UpdateAccountUseCasePort,
} from "@/iam/application/ports/inbound/account";
import { ChangePasswordDto, RequestEmailChangeDto, UpdateAccountDto } from "../dtos";
import { IamExceptionFilter } from "../filters/iam-exception.filter";
import { ResponseMapper } from "../mappers/response.mapper";
import { Throttle } from "@nestjs/throttler";
import { Public } from "../decorators/public.decorator";

@UseFilters(IamExceptionFilter)
@ApiBearerAuth()
@ApiTags("Accounts")
@Controller("accounts")
export class AccountController {
	constructor(
		private readonly getUserByIdUseCase: GetUserByIdUseCasePort,
		private readonly changePasswordUseCase: ChangePasswordUseCasePort,
		private readonly updateAccountUseCase: UpdateAccountUseCasePort,
		private readonly deleteAccountUseCase: DeleteAccountUseCasePort,
		private readonly requestEmailChangeUseCase: RequestEmailChangeUseCasePort,
		private readonly confirmEmailChangeUseCase: ConfirmEmailChangeUseCasePort,
	) {}

	@Get("profile")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get current authenticated user profile." })
	public async getProfile(@CurrentUser() userPayload: JwtPayload) {
		const query = new GetUserByIdQuery(userPayload.sub);

		return await this.getUserByIdUseCase.execute(query);
	}

	@Patch("profile")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Update the current authenticated user's profile details." })
	public async updateProfile(
		@CurrentUser() userPayload: JwtPayload,
		@Body() dto: UpdateAccountDto,
	) {
		const command = new UpdateAccountCommand(userPayload.sub, dto.name, dto.image);

		return await this.updateAccountUseCase.execute(command);
	}

	@Patch("change-password")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Change the password for the current authenticated user." })
	public async changePassword(
		@CurrentUser() userPayload: JwtPayload,
		@Body() dto: ChangePasswordDto,
	): Promise<void> {
		const command = new ChangePasswordCommand(
			userPayload.sub,
			dto.currentPassword,
			dto.newPassword,
		);

		await this.changePasswordUseCase.execute(command);
	}

	@Patch("change-email/request")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Request an email change and send verification to the new address." })
	public async requestEmailChange(
		@CurrentUser() userPayload: JwtPayload,
		@Body() dto: RequestEmailChangeDto,
	) {
		const command = new RequestEmailChangeCommand(userPayload.sub, dto.newEmail);

		const result = await this.requestEmailChangeUseCase.execute(command);

		return ResponseMapper.toRequestEmailChangeMessage(result.changeEmailRequestEnqueued);
	}

	@Public()
	@Patch("change-email/confirm/:token")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Confirm an email change using the verification token." })
	public async confirmEmailChange(@Param("token") token: string): Promise<void> {
		const command = new ConfirmEmailChangeCommand(token);
		await this.confirmEmailChangeUseCase.execute(command);
	}

	@Delete()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete the current authenticated user's account permanently." })
	public async deleteAccount(@CurrentUser() userPayload: JwtPayload): Promise<void> {
		const command = new DeleteAccountCommand(userPayload.sub);

		await this.deleteAccountUseCase.execute(command);
	}
}
