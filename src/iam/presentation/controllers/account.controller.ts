import { type JwtPayload } from "@/iam/application/ports/outbound";
import { Body, Controller, Get, HttpCode, HttpStatus, Patch, UseFilters } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../decorators/current-user.decorator";
import {
	ChangePasswordCommand,
	ChangePasswordUseCasePort,
	GetUserByIdQuery,
	GetUserByIdUseCasePort,
} from "@/iam/application/ports/inbound/account";
import { ChangePasswordDto } from "../dtos";
import { IamExceptionFilter } from "../filters/iam-exception.filter";

@UseFilters(IamExceptionFilter)
@ApiBearerAuth()
@ApiTags("Accounts")
@Controller("accounts")
export class AccountController {
	constructor(
		private readonly getUserByIdUseCase: GetUserByIdUseCasePort,
		private readonly changePasswordUseCase: ChangePasswordUseCasePort,
	) {}

	@Get("profile")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get current authenticated user profile" })
	public async getProfile(@CurrentUser() userPayload: JwtPayload) {
		const query = new GetUserByIdQuery(userPayload.sub);

		return await this.getUserByIdUseCase.execute(query);
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
