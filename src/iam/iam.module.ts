import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
import { DatabaseModule } from "@/shared/database/database.module";
import { NestjsEventDispatcherAdapter } from "@/shared/infrastructure/adapters";
import { QueueModule } from "@/shared/queue/queue.module";
import { Module } from "@nestjs/common";
import {
	ChangePasswordUseCasePort,
	ConfirmEmailChangeUseCasePort,
	DeleteAccountUseCasePort,
	GetUserByIdUseCasePort,
	RemoveAvatarUseCasePort,
	RequestEmailChangeUseCasePort,
	UpdateAccountUseCasePort,
	UploadAvatarUseCasePort,
} from "./application/ports/inbound/account";
import {
	EnqueueChangeEmailRequestUseCasePort,
	EnqueueEmailChangedAlertUseCasePort,
	EnqueueFarewellEmailUseCasePort,
	EnqueuePasswordChangedAlertUseCasePort,
} from "./application/ports/inbound/account/notifications";
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
import {
	EnqueuePasswordResetEmailUseCasePort,
	EnqueueVerificationEmailUseCasePort,
	EnqueueWelcomeEmailUseCasePort,
} from "./application/ports/inbound/authentication/notifications";
import { GetRolesUseCasePort } from "./application/ports/inbound/roles";
import {
	GetPublicUserProfileUseCasePort,
	GetUsersUseCasePort,
} from "./application/ports/inbound/users";
import {
	AuthConfigPort,
	EmailQueueServicePort,
	HashServicePort,
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
	RemoveAvatarUseCase,
	RequestEmailChangeUseCase,
	UpdateAccountUseCase,
	UploadAvatarUseCase,
} from "./application/use-cases/account";
import {
	EnqueueChangeEmailRequestUseCase,
	EnqueueEmailChangedAlertUseCase,
	EnqueueFarewellEmailUseCase,
	EnqueuePasswordChangedAlertUseCase,
} from "./application/use-cases/account/notifications";
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
import {
	EnqueuePasswordResetEmailUseCase,
	EnqueueVerificationEmailUseCase,
	EnqueueWelcomeEmailUseCase,
} from "./application/use-cases/authentication/notifications";
import { GetRolesUseCase } from "./application/use-cases/roles";
import { GetPublicUserProfileUseCase, GetUsersUseCase } from "./application/use-cases/users";
import { RoleRepository, UserRepository } from "./domain/repositories";
import {
	BcryptHashAdapter,
	BullMqEmailQueueAdapter,
	CloudinaryImageStorageAdapter,
	EnvAuthConfigAdapter,
	MsTimeFormatterAdapter,
	NestjsJwtAdapter,
	NodeCryptoAdapter,
} from "./infrastructure/adapters";
import { PrismaRoleRepository, PrismaUserRepository } from "./infrastructure/adapters/persistence";
import { AccountController } from "./presentation/controllers/account.controller";
import { AdminController } from "./presentation/controllers/admin.controller";
import { AuthController } from "./presentation/controllers/auth.controller";
import { RoleController } from "./presentation/controllers/role.controller";
import { UserController } from "./presentation/controllers/user.controller";
import {
	EmailChangeRequestedListener,
	PasswordResetRequestedListener,
	UserAccountDeletedListener,
	UserEmailChangedListener,
	UserEmailVerifiedListener,
	UserPasswordChangedListener,
	UserRegisteredListener,
	VerificationEmailResentListener,
} from "./presentation/event-listeners";

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
		{ provide: RemoveAvatarUseCasePort, useClass: RemoveAvatarUseCase },

		//! Users
		{ provide: GetUsersUseCasePort, useClass: GetUsersUseCase },
		{ provide: GetPublicUserProfileUseCasePort, useClass: GetPublicUserProfileUseCase },

		//! Roles
		{ provide: GetRolesUseCasePort, useClass: GetRolesUseCase },

		//! Outbound - Adapters
		{ provide: HashServicePort, useClass: BcryptHashAdapter },
		{ provide: JwtServicePort, useClass: NestjsJwtAdapter },
		{ provide: IdGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: VerificationTokenGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: EmailQueueServicePort, useClass: BullMqEmailQueueAdapter },
		{ provide: TimeFormatterPort, useClass: MsTimeFormatterAdapter },
		{ provide: AuthConfigPort, useClass: EnvAuthConfigAdapter },
		{ provide: ImageStoragePort, useClass: CloudinaryImageStorageAdapter },
		{ provide: DomainEventDispatcherPort, useClass: NestjsEventDispatcherAdapter },

		//! Persistence
		{ provide: UserRepository, useClass: PrismaUserRepository },
		{ provide: RoleRepository, useClass: PrismaRoleRepository },

		//! Domain Event and Event Listeners
		EmailChangeRequestedListener,
		PasswordResetRequestedListener,
		UserAccountDeletedListener,
		UserEmailChangedListener,
		UserEmailVerifiedListener,
		UserPasswordChangedListener,
		VerificationEmailResentListener,
		UserRegisteredListener,
		{ provide: EnqueueVerificationEmailUseCasePort, useClass: EnqueueVerificationEmailUseCase },
		{ provide: EnqueuePasswordResetEmailUseCasePort, useClass: EnqueuePasswordResetEmailUseCase },
		{ provide: EnqueueChangeEmailRequestUseCasePort, useClass: EnqueueChangeEmailRequestUseCase },
		{
			provide: EnqueuePasswordChangedAlertUseCasePort,
			useClass: EnqueuePasswordChangedAlertUseCase,
		},
		{ provide: EnqueueEmailChangedAlertUseCasePort, useClass: EnqueueEmailChangedAlertUseCase },
		{ provide: EnqueueWelcomeEmailUseCasePort, useClass: EnqueueWelcomeEmailUseCase },
		{ provide: EnqueueFarewellEmailUseCasePort, useClass: EnqueueFarewellEmailUseCase },
	],
})
export class IamModule {}
