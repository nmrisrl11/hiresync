import {
	ChangePasswordCommand,
	ChangePasswordUseCasePort,
	ConfirmEmailChangeCommand,
	ConfirmEmailChangeUseCasePort,
	GetActiveSessionsQuery,
	GetActiveSessionsUseCasePort,
	GetUserByIdQuery,
	GetUserByIdUseCasePort,
	RemoveAvatarCommand,
	RemoveAvatarUseCasePort,
	RequestEmailChangeCommand,
	RequestEmailChangeUseCasePort,
	RevokeAllOtherSessionsCommand,
	RevokeAllOtherSessionsUseCasePort,
	RevokeSessionCommand,
	RevokeSessionUseCasePort,
	ScheduleAccountDeletionCommand,
	ScheduleAccountDeletionUseCasePort,
	UpdateAccountCommand,
	UpdateAccountUseCasePort,
	UploadAvatarCommand,
	UploadAvatarUseCasePort,
} from "@/iam/application/ports/inbound/account";
import {
	DisableMfaCommand,
	DisableMfaUseCasePort,
	EnableMfaCommand,
	EnableMfaUseCasePort,
	InitiateMfaSetupCommand,
	InitiateMfaSetupUseCasePort,
} from "@/iam/application/ports/inbound/account/mfa";
import { CurrentUser, Public } from "@/shared/http/decorators";
import { type JwtPayload } from "@/shared/types";
import {
	Body,
	Controller,
	Delete,
	FileTypeValidator,
	Get,
	HttpCode,
	HttpStatus,
	MaxFileSizeValidator,
	Param,
	ParseFilePipe,
	Patch,
	Post,
	UploadedFile,
	UseFilters,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import "multer";
import { ChangePasswordDto, RequestEmailChangeDto, UpdateAccountDto } from "../dtos/account";
import { IamExceptionFilter } from "../filters/iam-exception.filter";
import { ResponseMapper } from "../mappers/response.mapper";
import { DisableMfaDto, EnableMfaDto } from "../dtos/authentication";

@UseFilters(IamExceptionFilter)
@ApiBearerAuth()
@ApiTags("Accounts")
@Controller("accounts")
export class AccountController {
	constructor(
		private readonly getUserByIdUseCase: GetUserByIdUseCasePort,
		private readonly changePasswordUseCase: ChangePasswordUseCasePort,
		private readonly updateAccountUseCase: UpdateAccountUseCasePort,
		private readonly requestEmailChangeUseCase: RequestEmailChangeUseCasePort,
		private readonly confirmEmailChangeUseCase: ConfirmEmailChangeUseCasePort,
		private readonly uploadAvatarUseCase: UploadAvatarUseCasePort,
		private readonly removeAvatarUseCase: RemoveAvatarUseCasePort,
		private readonly scheduleAccountDeletionUseCase: ScheduleAccountDeletionUseCasePort,
		private readonly getActiveSessionsUseCase: GetActiveSessionsUseCasePort,
		private readonly revokeSessionUseCase: RevokeSessionUseCasePort,
		private readonly revokeAllOtherSessionsUseCase: RevokeAllOtherSessionsUseCasePort,
		private readonly initiateMfaSetupUseCase: InitiateMfaSetupUseCasePort,
		private readonly enableMfaUseCase: EnableMfaUseCasePort,
		private readonly disableMfaUseCase: DisableMfaUseCasePort,
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

	@Post("avatar")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Upload and set a new profile avatar." })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				file: {
					type: "string",
					format: "binary",
				},
			},
		},
	})
	@UseInterceptors(FileInterceptor("file"))
	public async uploadAvatar(
		@CurrentUser() userPayload: JwtPayload,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), //! 2MB max
					new FileTypeValidator({ fileType: ".(png|jpeg|jpg|webp)" }),
				],
			}),
		)
		file: Express.Multer.File,
	) {
		const command = new UploadAvatarCommand(userPayload.sub, file.buffer, file.mimetype);

		return await this.uploadAvatarUseCase.execute(command);
	}

	@Delete("avatar")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Remove the user's profile avatar" })
	public async removeAvatar(@CurrentUser() userPayload: JwtPayload) {
		const command = new RemoveAvatarCommand(userPayload.sub);

		return await this.removeAvatarUseCase.execute(command);
	}

	@Patch("change-password")
	@HttpCode(HttpStatus.NO_CONTENT)
	@Throttle({ default: { ttl: 60000, limit: 3 } })
	@ApiOperation({ summary: "Change the password for the current authenticated user." })
	public async changePassword(
		@CurrentUser() userPayload: JwtPayload,
		@Body() dto: ChangePasswordDto,
	): Promise<void> {
		const command = new ChangePasswordCommand(
			userPayload.sub,
			dto.currentPassword,
			dto.newPassword,
			userPayload.sessionId,
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

		await this.requestEmailChangeUseCase.execute(command);

		return ResponseMapper.toRequestEmailChangeMessage();
	}

	@Public()
	@Patch("change-email/confirm/:token")
	@HttpCode(HttpStatus.NO_CONTENT)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Confirm an email change using the verification token." })
	public async confirmEmailChange(@Param("token") token: string): Promise<void> {
		const command = new ConfirmEmailChangeCommand(token);
		await this.confirmEmailChangeUseCase.execute(command);
	}

	@Delete()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Throttle({ default: { ttl: 60000, limit: 3 } })
	@ApiOperation({ summary: "Schedule the current authenticated user's account for deletion." })
	public async deleteAccount(@CurrentUser() userPayload: JwtPayload): Promise<void> {
		const command = new ScheduleAccountDeletionCommand(userPayload.sub);

		await this.scheduleAccountDeletionUseCase.execute(command);
	}

	@Get("sessions")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get all active login sessions for the current user." })
	public async getSessions(@CurrentUser() userPayload: JwtPayload) {
		const query = new GetActiveSessionsQuery(userPayload.sub);
		return await this.getActiveSessionsUseCase.execute(query, userPayload.sessionId);
	}

	@Delete("sessions/others")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Revoke all sessions except the current one." })
	public async revokeOtherSessions(@CurrentUser() userPayload: JwtPayload): Promise<void> {
		const command = new RevokeAllOtherSessionsCommand(userPayload.sub, userPayload.sessionId);
		await this.revokeAllOtherSessionsUseCase.execute(command);
	}

	@Delete("sessions/:id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Revoke a specific login session." })
	public async revokeSession(
		@CurrentUser() userPayload: JwtPayload,
		@Param("id") targetSessionId: string,
	): Promise<void> {
		const command = new RevokeSessionCommand(userPayload.sub, targetSessionId);
		await this.revokeSessionUseCase.execute(command);
	}

	@Post("mfa/setup")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Generate a new TOTP Base32 secret and QR code data URL for MFA enrollment.",
	})
	public async initiateMfaSetup(@CurrentUser() userPayload: JwtPayload) {
		const command = new InitiateMfaSetupCommand(userPayload.sub);

		return await this.initiateMfaSetupUseCase.execute(command);
	}

	@Post("mfa/enable")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Verify the first 6-digit TOTP code, enable MFA, and return 10 backup codes.",
	})
	public async enableMfa(@CurrentUser() userPayload: JwtPayload, @Body() dto: EnableMfaDto) {
		const command = new EnableMfaCommand(userPayload.sub, dto.code);

		return await this.enableMfaUseCase.execute(command);
	}

	@Delete("mfa/disable")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({
		summary: "Disable multi-factor authentication after verifying current password.",
	})
	public async disableMfa(
		@CurrentUser() userPayload: JwtPayload,
		@Body() dto: DisableMfaDto,
	): Promise<void> {
		const command = new DisableMfaCommand(userPayload.sub, dto.currentPassword);

		await this.disableMfaUseCase.execute(command);
	}
}
