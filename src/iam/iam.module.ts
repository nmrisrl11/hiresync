import { DatabaseModule } from "@/shared/database/database.module";
import { Module } from "@nestjs/common";
import {
	ChangePasswordUseCasePort,
	ConfirmEmailChangeUseCasePort,
	DeleteAccountUseCasePort,
	GetActiveSessionsUseCasePort,
	GetUserByIdUseCasePort,
	RemoveAvatarUseCasePort,
	RequestEmailChangeUseCasePort,
	RestoreAccountUseCasePort,
	RevokeAllOtherSessionsUseCasePort,
	RevokeSessionUseCasePort,
	ScheduleAccountDeletionUseCasePort,
	SetInitialPasswordUseCasePort,
	UpdateAccountUseCasePort,
	UploadAvatarUseCasePort,
} from "./application/ports/inbound/account";
import {
	DisableMfaUseCasePort,
	EnableMfaUseCasePort,
	InitiateMfaSetupUseCasePort,
} from "./application/ports/inbound/account/mfa";
import {
	EnqueueAccountDeletionScheduledEmailUseCasePort,
	EnqueueAccountRestoredEmailUseCasePort,
	EnqueueChangeEmailRequestUseCasePort,
	EnqueueEmailChangedAlertUseCasePort,
	EnqueueFarewellEmailUseCasePort,
	EnqueueMfaDisabledAlertEmailUseCasePort,
	EnqueueMfaEnabledAlertEmailUseCasePort,
	EnqueuePasswordChangedAlertUseCasePort,
} from "./application/ports/inbound/account/notifications";
import {
	GetConnectedOAuthProvidersUseCasePort,
	LinkOAuthProviderUseCasePort,
	UnlinkOAuthProviderUseCasePort,
} from "./application/ports/inbound/account/oauth";
import {
	CleanExpiredSessionsUseCasePort,
	ExecuteHardDeletionUseCasePort,
} from "./application/ports/inbound/account/tasks";
import {
	ForgotPasswordUseCasePort,
	GetOAuthAuthUrlUseCasePort,
	LoginUseCasePort,
	LogoutUseCasePort,
	MfaLoginUseCasePort,
	OAuthCallbackLoginUseCasePort,
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
	BackupCodesGeneratorPort,
	EnvConfigPort,
	HashServicePort,
	IamEmailQueuePort,
	ImageStoragePort,
	JwtServicePort,
	MfaServicePort,
	OAuthProviderPort,
	StateGeneratorPort,
	TimeFormatterPort,
	VerificationTokenGeneratorPort,
} from "./application/ports/outbound";
import {
	ChangePasswordUseCase,
	ConfirmEmailChangeUseCase,
	DeleteAccountUseCase,
	GetActiveSessionsUseCase,
	GetUserByIdUseCase,
	RemoveAvatarUseCase,
	RequestEmailChangeUseCase,
	RestoreAccountUseCase,
	RevokeAllOtherSessionsUseCase,
	RevokeSessionUseCase,
	ScheduleAccountDeletionUseCase,
	SetInitialPasswordUseCase,
	UpdateAccountUseCase,
	UploadAvatarUseCase,
} from "./application/use-cases/account";
import {
	DisableMfaUseCase,
	EnableMfaUseCase,
	InitiateMfaSetupUseCase,
} from "./application/use-cases/account/mfa";
import {
	EnqueueAccountDeletionScheduledEmailUseCase,
	EnqueueAccountRestoredEmailUseCase,
	EnqueueChangeEmailRequestUseCase,
	EnqueueEmailChangedAlertUseCase,
	EnqueueFarewellEmailUseCase,
	EnqueueMfaDisabledAlertEmailUseCase,
	EnqueueMfaEnabledAlertEmailUseCase,
	EnqueuePasswordChangedAlertUseCase,
} from "./application/use-cases/account/notifications";
import {
	GetConnectedOAuthProvidersUseCase,
	LinkOAuthProviderUseCase,
	UnlinkOAuthProviderUseCase,
} from "./application/use-cases/account/oauth";
import {
	CleanExpiredSessionsUseCase,
	ExecuteHardDeletionUseCase,
} from "./application/use-cases/account/tasks";
import {
	ForgotPasswordUseCase,
	GetOAuthAuthUrlUseCase,
	LoginUseCase,
	LogoutUseCase,
	MfaLoginUseCase,
	OAuthCallbackLoginUseCase,
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
	BullMqIamEmailQueueAdapter,
	CloudinaryImageStorageAdapter,
	EnvConfigAdapter,
	ManualOAuthAdapter,
	MsTimeFormatterAdapter,
	NestjsJwtAdapter,
	NodeCryptoAdapter,
	SpeakeasyMfaAdapter,
} from "./infrastructure/adapters";
import { PrismaRoleRepository, PrismaUserRepository } from "./infrastructure/adapters/persistence";
import {
	EmailChangeRequestedListener,
	PasswordResetRequestedListener,
	UserAccountDeletedListener,
	UserAccountDeletionScheduledListener,
	UserAccountRestoredListener,
	UserEmailChangedListener,
	UserEmailVerifiedListener,
	UserMfaDisabledListener,
	UserMfaEnabledListener,
	UserPasswordChangedListener,
	UserRegisteredListener,
	VerificationEmailResentListener,
} from "./infrastructure/events/listeners";
import { IamNotificationsModule } from "./infrastructure/notifications/iam-notifications.module";
import { CleanExpiredSessionsTask, ExecutePendingDeletionsTask } from "./infrastructure/tasks";
import { AccountController } from "./presentation/controllers/account.controller";
import { AdminController } from "./presentation/controllers/admin.controller";
import { AuthController } from "./presentation/controllers/auth.controller";
import { OAuthController } from "./presentation/controllers/oauth.controller";
import { RoleController } from "./presentation/controllers/role.controller";
import { UserController } from "./presentation/controllers/user.controller";

@Module({
	imports: [DatabaseModule, IamNotificationsModule],
	controllers: [
		AuthController,
		OAuthController,
		AccountController,
		AdminController,
		UserController,
		RoleController,
	],
	providers: [
		//! Repositories and Persistence
		{ provide: UserRepository, useClass: PrismaUserRepository },
		{ provide: RoleRepository, useClass: PrismaRoleRepository },

		//! Use Cases
		/** Auhentication **/
		{ provide: RegisterUserUseCasePort, useClass: RegisterUserUseCase },
		{ provide: VerifyEmailUseCasePort, useClass: VerifyEmailUseCase },
		{ provide: LoginUseCasePort, useClass: LoginUseCase },
		{ provide: LogoutUseCasePort, useClass: LogoutUseCase },
		{ provide: ForgotPasswordUseCasePort, useClass: ForgotPasswordUseCase },
		{ provide: ResetPasswordUseCasePort, useClass: ResetPasswordUseCase },
		{ provide: RefreshTokenUseCasePort, useClass: RefreshTokenUseCase },
		{ provide: ResendVerificationUseCasePort, useClass: ResendVerificationUsecase },
		{ provide: RestoreAccountUseCasePort, useClass: RestoreAccountUseCase },
		{ provide: MfaLoginUseCasePort, useClass: MfaLoginUseCase },
		{ provide: GetOAuthAuthUrlUseCasePort, useClass: GetOAuthAuthUrlUseCase },
		{ provide: OAuthCallbackLoginUseCasePort, useClass: OAuthCallbackLoginUseCase },

		/** Account **/
		{ provide: GetUserByIdUseCasePort, useClass: GetUserByIdUseCase },
		{ provide: ChangePasswordUseCasePort, useClass: ChangePasswordUseCase },
		{ provide: UpdateAccountUseCasePort, useClass: UpdateAccountUseCase },
		{ provide: DeleteAccountUseCasePort, useClass: DeleteAccountUseCase },
		{ provide: RequestEmailChangeUseCasePort, useClass: RequestEmailChangeUseCase },
		{ provide: ConfirmEmailChangeUseCasePort, useClass: ConfirmEmailChangeUseCase },
		{ provide: UploadAvatarUseCasePort, useClass: UploadAvatarUseCase },
		{ provide: RemoveAvatarUseCasePort, useClass: RemoveAvatarUseCase },
		{ provide: ScheduleAccountDeletionUseCasePort, useClass: ScheduleAccountDeletionUseCase },
		{ provide: GetActiveSessionsUseCasePort, useClass: GetActiveSessionsUseCase },
		{ provide: RevokeSessionUseCasePort, useClass: RevokeSessionUseCase },
		{ provide: RevokeAllOtherSessionsUseCasePort, useClass: RevokeAllOtherSessionsUseCase },
		{ provide: InitiateMfaSetupUseCasePort, useClass: InitiateMfaSetupUseCase },
		{ provide: EnableMfaUseCasePort, useClass: EnableMfaUseCase },
		{ provide: DisableMfaUseCasePort, useClass: DisableMfaUseCase },
		{ provide: SetInitialPasswordUseCasePort, useClass: SetInitialPasswordUseCase },
		{ provide: GetConnectedOAuthProvidersUseCasePort, useClass: GetConnectedOAuthProvidersUseCase },
		{ provide: LinkOAuthProviderUseCasePort, useClass: LinkOAuthProviderUseCase },
		{ provide: UnlinkOAuthProviderUseCasePort, useClass: UnlinkOAuthProviderUseCase },

		/** Users **/
		{ provide: GetUsersUseCasePort, useClass: GetUsersUseCase },
		{ provide: GetPublicUserProfileUseCasePort, useClass: GetPublicUserProfileUseCase },

		/** Roles **/
		{ provide: GetRolesUseCasePort, useClass: GetRolesUseCase },

		//! Outbound - Adapters
		{ provide: HashServicePort, useClass: BcryptHashAdapter },
		{ provide: JwtServicePort, useClass: NestjsJwtAdapter },
		{ provide: VerificationTokenGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: BackupCodesGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: StateGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: IamEmailQueuePort, useClass: BullMqIamEmailQueueAdapter },
		{ provide: TimeFormatterPort, useClass: MsTimeFormatterAdapter },
		{ provide: EnvConfigPort, useClass: EnvConfigAdapter },
		{ provide: ImageStoragePort, useClass: CloudinaryImageStorageAdapter },
		{ provide: MfaServicePort, useClass: SpeakeasyMfaAdapter },
		{ provide: OAuthProviderPort, useClass: ManualOAuthAdapter },

		//! Domain Event and Event Listeners
		EmailChangeRequestedListener,
		PasswordResetRequestedListener,
		UserAccountDeletedListener,
		UserEmailChangedListener,
		UserEmailVerifiedListener,
		UserPasswordChangedListener,
		VerificationEmailResentListener,
		UserRegisteredListener,
		UserAccountDeletionScheduledListener,
		UserAccountRestoredListener,
		UserMfaEnabledListener,
		UserMfaDisabledListener,
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
		{
			provide: EnqueueAccountDeletionScheduledEmailUseCasePort,
			useClass: EnqueueAccountDeletionScheduledEmailUseCase,
		},
		{
			provide: EnqueueAccountRestoredEmailUseCasePort,
			useClass: EnqueueAccountRestoredEmailUseCase,
		},
		{
			provide: EnqueueMfaEnabledAlertEmailUseCasePort,
			useClass: EnqueueMfaEnabledAlertEmailUseCase,
		},
		{
			provide: EnqueueMfaDisabledAlertEmailUseCasePort,
			useClass: EnqueueMfaDisabledAlertEmailUseCase,
		},

		//! Tasks
		ExecutePendingDeletionsTask,
		CleanExpiredSessionsTask,
		{ provide: ExecuteHardDeletionUseCasePort, useClass: ExecuteHardDeletionUseCase },
		{ provide: CleanExpiredSessionsUseCasePort, useClass: CleanExpiredSessionsUseCase },
	],
})
export class IamModule {}
