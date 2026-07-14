import { DatabaseModule } from "@/shared/database/database.module";
import { QueueModule } from "@/shared/queue/queue.module";
import { Module } from "@nestjs/common";
import {
	ChangePasswordUseCasePort,
	DeleteAccountUseCasePort,
	GetUserByIdUseCasePort,
	UpdateAccountUseCasePort,
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
	JwtServicePort,
	TimeFormatterPort,
	VerificationTokenGeneratorPort,
} from "./application/ports/outbound";
import {
	ChangePasswordUseCase,
	DeleteAccountUseCase,
	GetUserByIdUseCase,
	UpdateAccountUseCase,
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
import { GetPublicUserProfileUseCase, GetUsersUseCase } from "./application/use-cases/users";
import { BcryptHashAdapter } from "./infrastructure/adapters/outbound/bcrypt-hash.adapter";
import { BullMqEmailQueueAdapter } from "./infrastructure/adapters/outbound/bullmq-email-queue.adapter";
import { EnvAuthConfigAdapter } from "./infrastructure/adapters/outbound/env-auth-config.adapter";
import { MsTimeFormatterAdapter } from "./infrastructure/adapters/outbound/ms-time-formatter.adapter";
import { NestjsJwtAdapter } from "./infrastructure/adapters/outbound/nestjs-jwt.adapter";
import { NodeCryptoAdapter } from "./infrastructure/adapters/outbound/node-crypto.adapter";
import { PrismaIamRepository } from "./infrastructure/adapters/outbound/prisma-iam.repository";
import { AccountController } from "./presentation/controllers/account.controller";
import { AdminController } from "./presentation/controllers/admin.controller";
import { AuthController } from "./presentation/controllers/auth.controller";
import { UserController } from "./presentation/controllers/user.controller";

@Module({
	imports: [DatabaseModule, QueueModule],
	controllers: [AuthController, AccountController, AdminController, UserController],
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

		//! Users
		{ provide: GetUsersUseCasePort, useClass: GetUsersUseCase },
		{ provide: GetPublicUserProfileUseCasePort, useClass: GetPublicUserProfileUseCase },

		{ provide: IamRepositoryPort, useClass: PrismaIamRepository },
		{ provide: HashServicePort, useClass: BcryptHashAdapter },
		{ provide: JwtServicePort, useClass: NestjsJwtAdapter },
		{ provide: IdGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: VerificationTokenGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: EmailQueueServicePort, useClass: BullMqEmailQueueAdapter },
		{ provide: TimeFormatterPort, useClass: MsTimeFormatterAdapter },
		{ provide: AuthConfigPort, useClass: EnvAuthConfigAdapter },
	],
})
export class IamModule {}
