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
	SetInitialPasswordCommand,
	SetInitialPasswordUseCasePort,
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
import {
	GetConnectedOAuthProvidersUseCasePort,
	UnlinkOAuthProviderCommand,
	UnlinkOAuthProviderUseCasePort,
} from "@/iam/application/ports/inbound/account/oauth";
import {
	GetOAuthAuthUrlCommand,
	GetOAuthAuthUrlUseCasePort,
} from "@/iam/application/ports/inbound/authentication";
import { OAuthProviderType } from "@/iam/domain/types";
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
	Res,
	UploadedFile,
	UseFilters,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Response } from "express";
import "multer";
import {
	ActiveSessionsResponseDto,
	ChangePasswordRequestDto,
	ConnectedProvidersResponseDto,
	MfaEnableResponseDto,
	MfaSetupResponseDto,
	OAuthLinkUrlResponseDto,
	RequestEmailChangeRequestDto,
	SetInitialPasswordRequestDto,
	UpdateAccountRequestDto,
	UserProfileResponseDto,
} from "../dtos/account";
import { DisableMfaDto, EnableMfaDto } from "../dtos/authentication";
import { IamExceptionFilter } from "../filters/iam-exception.filter";
import {
	ActiveSessionsResponseMapper,
	ConnectedProvidersResponseMapper,
	MfaEnableResponseMapper,
	MfaSetupResponseMapper,
	OAuthLinkUrlResponseMapper,
	UserProfileResponseMapper,
} from "../mappers/account";

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
		private readonly setInitialPasswordUseCase: SetInitialPasswordUseCasePort,
		private readonly getConnectedOAuthProvidersUseCase: GetConnectedOAuthProvidersUseCasePort,
		private readonly unlinkOAuthProviderUseCase: UnlinkOAuthProviderUseCasePort,
		private readonly getOAuthAuthUrlUseCase: GetOAuthAuthUrlUseCasePort,
	) {}

	@Get("profile")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get current authenticated user profile." })
	@ApiSuccessResponse(UserProfileResponseDto, HttpStatus.OK, "Profile retrieved successfully.")
	public async getProfile(@CurrentUser() userPayload: JwtPayload): Promise<UserProfileResponseDto> {
		const query = new GetUserByIdQuery(userPayload.sub);
		const userResult = await this.getUserByIdUseCase.execute(query);
		return UserProfileResponseMapper.toDto(userResult);
	}

	@Patch("profile")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Update the current authenticated user's profile details." })
	@ApiSuccessResponse(UserProfileResponseDto, HttpStatus.OK, "Profile updated successfully.")
	public async updateProfile(
		@CurrentUser() userPayload: JwtPayload,
		@Body() dto: UpdateAccountRequestDto,
	): Promise<UserProfileResponseDto> {
		const command = new UpdateAccountCommand(userPayload.sub, dto.name, dto.image);
		const userResult = await this.updateAccountUseCase.execute(command);
		return UserProfileResponseMapper.toDto(userResult);
	}

	@Post("avatar")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Upload and set a new profile avatar." })
	@ApiMessageResponse(HttpStatus.OK, "Avatar uploaded successfully.")
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
		await this.uploadAvatarUseCase.execute(command);
		return { message: "Avatar uploaded successfully." };
	}

	@Delete("avatar")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Remove the user's profile avatar" })
	@ApiMessageResponse(HttpStatus.OK, "Avatar removed successfully.")
	public async removeAvatar(@CurrentUser() userPayload: JwtPayload) {
		const command = new RemoveAvatarCommand(userPayload.sub);
		await this.removeAvatarUseCase.execute(command);
		return { message: "Avatar removed successfully." };
	}

	@Patch("change-password")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 3 } })
	@ApiOperation({ summary: "Change the password for the current authenticated user." })
	@ApiMessageResponse(HttpStatus.OK, "Password changed successfully.")
	public async changePassword(
		@CurrentUser() userPayload: JwtPayload,
		@Body() dto: ChangePasswordRequestDto,
	) {
		const command = new ChangePasswordCommand(
			userPayload.sub,
			dto.currentPassword,
			dto.newPassword,
			userPayload.sessionId,
		);
		await this.changePasswordUseCase.execute(command);
		return { message: "Password changed successfully." };
	}

	@Patch("change-email/request")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Request an email change and send verification to the new address." })
	@ApiMessageResponse(
		HttpStatus.OK,
		"Change email requested successfully. Please check your new email inbox to confirm. If you do not receive it within a few minutes, you can request it again.",
	)
	public async requestEmailChange(
		@CurrentUser() userPayload: JwtPayload,
		@Body() dto: RequestEmailChangeRequestDto,
	) {
		const command = new RequestEmailChangeCommand(userPayload.sub, dto.newEmail);
		await this.requestEmailChangeUseCase.execute(command);
		return {
			message:
				"Change email requested successfully. Please check your new email inbox to confirm. If you do not receive it within a few minutes, you can request it again.",
		};
	}

	@Public()
	@Patch("change-email/confirm/:token")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Confirm an email change using the verification token." })
	@ApiMessageResponse(HttpStatus.OK, "Email successfully changed.")
	public async confirmEmailChange(@Param("token") token: string) {
		const command = new ConfirmEmailChangeCommand(token);
		await this.confirmEmailChangeUseCase.execute(command);
		return { message: "Email successfully changed." };
	}

	@Post("password/initial")
	@HttpCode(HttpStatus.OK)
	@ApiBearerAuth()
	@ApiOperation({ summary: "Set an initial password for an OAuth-only account." })
	@ApiMessageResponse(
		HttpStatus.OK,
		"Initial password successfully set. You can now log in using credentials.",
	)
	public async setInitialPassword(
		@CurrentUser() userPayload: JwtPayload,
		@Body() dto: SetInitialPasswordRequestDto,
	) {
		const command = new SetInitialPasswordCommand(userPayload.sub, dto.newPassword);
		await this.setInitialPasswordUseCase.execute(command);
		return { message: "Initial password successfully set. You can now log in using credentials." };
	}

	@Delete()
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 3 } })
	@ApiOperation({ summary: "Schedule the current authenticated user's account for deletion." })
	@ApiMessageResponse(HttpStatus.OK, "Account scheduled for deletion.")
	public async deleteAccount(@CurrentUser() userPayload: JwtPayload) {
		const command = new ScheduleAccountDeletionCommand(userPayload.sub);
		await this.scheduleAccountDeletionUseCase.execute(command);
		return { message: "Account scheduled for deletion." };
	}

	@Get("sessions")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get all active login sessions for the current user." })
	@ApiSuccessResponse(
		ActiveSessionsResponseDto,
		HttpStatus.OK,
		"Active sessions retrieved successfully.",
	)
	public async getSessions(
		@CurrentUser() userPayload: JwtPayload,
	): Promise<ActiveSessionsResponseDto> {
		const query = new GetActiveSessionsQuery(userPayload.sub);
		const sessions = await this.getActiveSessionsUseCase.execute(query, userPayload.sessionId);
		return ActiveSessionsResponseMapper.toDto(sessions);
	}

	@Delete("sessions/others")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Revoke all sessions except the current one." })
	@ApiMessageResponse(HttpStatus.OK, "All other sessions revoked successfully.")
	public async revokeOtherSessions(@CurrentUser() userPayload: JwtPayload) {
		const command = new RevokeAllOtherSessionsCommand(userPayload.sub, userPayload.sessionId);
		await this.revokeAllOtherSessionsUseCase.execute(command);
		return { message: "All other sessions revoked successfully." };
	}

	@Delete("sessions/:id")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Revoke a specific login session." })
	@ApiMessageResponse(HttpStatus.OK, "Session revoked successfully.")
	public async revokeSession(
		@CurrentUser() userPayload: JwtPayload,
		@Param("id") targetSessionId: string,
	) {
		const command = new RevokeSessionCommand(userPayload.sub, targetSessionId);
		await this.revokeSessionUseCase.execute(command);
		return { message: "Session revoked successfully." };
	}

	@Post("mfa/setup")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Generate a new TOTP Base32 secret and QR code data URL for MFA enrollment.",
	})
	@ApiSuccessResponse(MfaSetupResponseDto, HttpStatus.OK, "MFA setup initiated.")
	public async initiateMfaSetup(
		@CurrentUser() userPayload: JwtPayload,
	): Promise<MfaSetupResponseDto> {
		const command = new InitiateMfaSetupCommand(userPayload.sub);
		const result = await this.initiateMfaSetupUseCase.execute(command);
		return MfaSetupResponseMapper.toDto(result);
	}

	@Post("mfa/enable")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Verify the first 6-digit TOTP code, enable MFA, and return 10 backup codes.",
	})
	@ApiSuccessResponse(MfaEnableResponseDto, HttpStatus.OK, "MFA successfully enabled.")
	public async enableMfa(
		@CurrentUser() userPayload: JwtPayload,
		@Body() dto: EnableMfaDto,
	): Promise<MfaEnableResponseDto> {
		const command = new EnableMfaCommand(userPayload.sub, dto.code);
		const result = await this.enableMfaUseCase.execute(command);
		return MfaEnableResponseMapper.toDto(result);
	}

	@Delete("mfa/disable")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: "Disable multi-factor authentication after verifying current password.",
	})
	@ApiMessageResponse(HttpStatus.OK, "MFA disabled successfully.")
	public async disableMfa(@CurrentUser() userPayload: JwtPayload, @Body() dto: DisableMfaDto) {
		const command = new DisableMfaCommand(userPayload.sub, dto.currentPassword);
		await this.disableMfaUseCase.execute(command);
		return { message: "MFA disabled successfully." };
	}

	@Get("oauth")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get a list of connected OAuth providers." })
	@ApiSuccessResponse(
		ConnectedProvidersResponseDto,
		HttpStatus.OK,
		"Connected providers retrieved successfully.",
	)
	public async getConnectedProviders(
		@CurrentUser() userPayload: JwtPayload,
	): Promise<ConnectedProvidersResponseDto> {
		const providers = await this.getConnectedOAuthProvidersUseCase.execute(userPayload.sub);
		return ConnectedProvidersResponseMapper.toDto(providers);
	}

	@Get("oauth/:provider/link-url")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Generate URL to link an OAuth provider to the current account." })
	@ApiSuccessResponse(OAuthLinkUrlResponseDto, HttpStatus.OK, "Authorization URL generated.")
	public async getLinkProviderUrl(
		@Param("provider") providerParam: string,
		@CurrentUser() userPayload: JwtPayload,
		@Res({ passthrough: true }) res: Response,
	): Promise<OAuthLinkUrlResponseDto> {
		const provider = providerParam.toUpperCase() as OAuthProviderType;
		const command = new GetOAuthAuthUrlCommand(provider);
		const result = await this.getOAuthAuthUrlUseCase.execute(command);

		res.cookie("oauth_link_intent", userPayload.sub, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 5 * 60 * 1000,
			path: "/api/auth/oauth",
		});

		return OAuthLinkUrlResponseMapper.toDto(result);
	}

	@Delete("oauth/:provider")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Unlink an OAuth provider from the account." })
	@ApiMessageResponse(HttpStatus.OK, "Provider unlinked successfully.")
	public async unlinkProvider(
		@Param("provider") providerParam: string,
		@CurrentUser() userPayload: JwtPayload,
	) {
		const provider = providerParam.toUpperCase() as OAuthProviderType;
		const command = new UnlinkOAuthProviderCommand(userPayload.sub, provider);
		await this.unlinkOAuthProviderUseCase.execute(command);
		return { message: `Successfully unlinked ${provider} from your account.` };
	}
}
