import { type JwtPayload } from "@/iam/application/ports/outbound";
import { Body, Controller, Get, HttpCode, HttpStatus, Patch, UseFilters } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../decorators/current-user.decorator";
import {
	ChangePasswordCommand,
	ChangePasswordUseCasePort,
	GetUserByIdQuery,
	GetUserByIdUseCasePort,
	UpdateAccountCommand,
	UpdateAccountUseCasePort,
} from "@/iam/application/ports/inbound/account";
import { ChangePasswordDto, UpdateAccountDto } from "../dtos";
import { IamExceptionFilter } from "../filters/iam-exception.filter";

@UseFilters(IamExceptionFilter)
@ApiBearerAuth()
@ApiTags("Accounts")
@Controller("accounts")
export class AccountController {
	constructor(
		private readonly getUserByIdUseCase: GetUserByIdUseCasePort,
		private readonly changePasswordUseCase: ChangePasswordUseCasePort,
		private readonly updateAccountUseCase: UpdateAccountUseCasePort,
	) {}

	@Get("profile")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get current authenticated user profile" })
	public async getProfile(@CurrentUser() userPayload: JwtPayload) {
		const query = new GetUserByIdQuery(userPayload.sub);

		return await this.getUserByIdUseCase.execute(query);
	}

	@Patch("profile")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Update the current authenticated user's profile details" })
	public async updateProfile(
		@CurrentUser() userPayload: JwtPayload,
		@Body() dto: UpdateAccountDto,
	) {
		const command = new UpdateAccountCommand(userPayload.sub, dto.name, dto.image);

		return await this.updateAccountUseCase.execute(command);
	}

	@Patch("change-password")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Change the password for the current authenticated user" })
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
}
