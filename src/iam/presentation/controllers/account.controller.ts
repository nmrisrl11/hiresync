import {
	ChangePasswordCommand,
	ChangePasswordUseCasePort,
	ConfirmEmailChangeCommand,
	ConfirmEmailChangeUseCasePort,
	DeleteAccountCommand,
	DeleteAccountUseCasePort,
	GetUserByIdQuery,
	GetUserByIdUseCasePort,
	RemoveAvatarCommand,
	RemoveAvatarUseCasePort,
	RequestEmailChangeCommand,
	RequestEmailChangeUseCasePort,
	UpdateAccountCommand,
	UpdateAccountUseCasePort,
	UploadAvatarCommand,
	UploadAvatarUseCasePort,
} from "@/iam/application/ports/inbound/account";
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
		private readonly uploadAvatarUseCase: UploadAvatarUseCasePort,
		private readonly removeAvatarUseCase: RemoveAvatarUseCasePort,
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
	@ApiOperation({ summary: "Delete the current authenticated user's account permanently." })
	public async deleteAccount(@CurrentUser() userPayload: JwtPayload): Promise<void> {
		const command = new DeleteAccountCommand(userPayload.sub);

		await this.deleteAccountUseCase.execute(command);
	}
}
