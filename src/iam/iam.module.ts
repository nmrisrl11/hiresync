import { DatabaseModule } from "@/shared/database/database.module";
import { QueueModule } from "@/shared/queue/queue.module";
import { Module } from "@nestjs/common";
import {
	ChangePasswordUseCasePort,
	ConfirmEmailChangeUseCasePort,
	DeleteAccountUseCasePort,
	GetUserByIdUseCasePort,
	RequestEmailChangeUseCasePort,
	UpdateAccountUseCasePort,
	UploadAvatarUseCasePort,
} from "./application/ports/inbound/account";
import {
	ForgotPasswordUseCasePort,
	LoginUseCasePort,
	LogoutUseCasePort,
	RefreshTokenUseCasePort,
	RegisterUserUseCasePort,
	ResendVerificationUseCasePort,
	ResetPasswordUseCasePort,
	VerifyEmailUseCasePort,
} from "./application/ports/inbound/authentication";
import { GetRolesUseCasePort } from "./application/ports/inbound/roles";
import {
	GetPublicUserProfileUseCasePort,
	GetUsersUseCasePort,
} from "./application/ports/inbound/users";
import {
	AuthConfigPort,
	EmailQueueServicePort,
	HashServicePort,
	IamRepositoryPort,
	IdGeneratorPort,
	ImageStoragePort,
	JwtServicePort,
	TimeFormatterPort,
	VerificationTokenGeneratorPort,
} from "./application/ports/outbound";
import {
	ChangePasswordUseCase,
	ConfirmEmailChangeUseCase,
	DeleteAccountUseCase,
	GetUserByIdUseCase,
	RequestEmailChangeUseCase,
	UpdateAccountUseCase,
	UploadAvatarUseCase,
} from "./application/use-cases/account";
import {
	ForgotPasswordUseCase,
	LoginUseCase,
	LogoutUseCase,
	RefreshTokenUseCase,
	RegisterUserUseCase,
	ResendVerificationUsecase,
	ResetPasswordUseCase,
	VerifyEmailUseCase,
} from "./application/use-cases/authentication";
import { GetRolesUseCase } from "./application/use-cases/roles";
import { GetPublicUserProfileUseCase, GetUsersUseCase } from "./application/use-cases/users";
import { BcryptHashAdapter } from "./infrastructure/adapters/bcrypt-hash.adapter";
import { BullMqEmailQueueAdapter } from "./infrastructure/adapters/bullmq-email-queue.adapter";
import { EnvAuthConfigAdapter } from "./infrastructure/adapters/env-auth-config.adapter";
import { MsTimeFormatterAdapter } from "./infrastructure/adapters/ms-time-formatter.adapter";
import { NestjsJwtAdapter } from "./infrastructure/adapters/nestjs-jwt.adapter";
import { NodeCryptoAdapter } from "./infrastructure/adapters/node-crypto.adapter";
import { PrismaIamRepository } from "./infrastructure/adapters/prisma-iam.repository";
import { AccountController } from "./presentation/controllers/account.controller";
import { AdminController } from "./presentation/controllers/admin.controller";
import { AuthController } from "./presentation/controllers/auth.controller";
import { RoleController } from "./presentation/controllers/role.controller";
import { UserController } from "./presentation/controllers/user.controller";
import { CloudinaryImageStorageAdapter } from "./infrastructure/adapters/cloudinary-image-storage.adapter";

@Module({
	imports: [DatabaseModule, QueueModule],
	controllers: [AuthController, AccountController, AdminController, UserController, RoleController],
	providers: [
		//! Authentication
		{ provide: RegisterUserUseCasePort, useClass: RegisterUserUseCase },
		{ provide: VerifyEmailUseCasePort, useClass: VerifyEmailUseCase },
		{ provide: LoginUseCasePort, useClass: LoginUseCase },
		{ provide: LogoutUseCasePort, useClass: LogoutUseCase },
		{ provide: ForgotPasswordUseCasePort, useClass: ForgotPasswordUseCase },
		{ provide: ResetPasswordUseCasePort, useClass: ResetPasswordUseCase },
		{ provide: RefreshTokenUseCasePort, useClass: RefreshTokenUseCase },
		{ provide: ResendVerificationUseCasePort, useClass: ResendVerificationUsecase },

		//! Account
		{ provide: GetUserByIdUseCasePort, useClass: GetUserByIdUseCase },
		{ provide: ChangePasswordUseCasePort, useClass: ChangePasswordUseCase },
		{ provide: UpdateAccountUseCasePort, useClass: UpdateAccountUseCase },
		{ provide: DeleteAccountUseCasePort, useClass: DeleteAccountUseCase },
		{ provide: RequestEmailChangeUseCasePort, useClass: RequestEmailChangeUseCase },
		{ provide: ConfirmEmailChangeUseCasePort, useClass: ConfirmEmailChangeUseCase },
		{ provide: UploadAvatarUseCasePort, useClass: UploadAvatarUseCase },

		//! Users
		{ provide: GetUsersUseCasePort, useClass: GetUsersUseCase },
		{ provide: GetPublicUserProfileUseCasePort, useClass: GetPublicUserProfileUseCase },

		//! Roles
		{ provide: GetRolesUseCasePort, useClass: GetRolesUseCase },

		{ provide: IamRepositoryPort, useClass: PrismaIamRepository },
		{ provide: HashServicePort, useClass: BcryptHashAdapter },
		{ provide: JwtServicePort, useClass: NestjsJwtAdapter },
		{ provide: IdGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: VerificationTokenGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: EmailQueueServicePort, useClass: BullMqEmailQueueAdapter },
		{ provide: TimeFormatterPort, useClass: MsTimeFormatterAdapter },
		{ provide: AuthConfigPort, useClass: EnvAuthConfigAdapter },
		{ provide: ImageStoragePort, useClass: CloudinaryImageStorageAdapter },
	],
})
export class IamModule {}
