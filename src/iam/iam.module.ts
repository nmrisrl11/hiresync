import { DatabaseModule } from "@/shared/database/database.module";
import { QueueModule } from "@/shared/queue/queue.module";
import { Module } from "@nestjs/common";
import { LoginUseCasePort } from "./application/ports/inbound/login.in-port";
import { LogoutUseCasePort } from "./application/ports/inbound/logout.in-port";
import { RegisterUserUseCasePort } from "./application/ports/inbound/register-user.in-port";
import { VerifyEmailUseCasePort } from "./application/ports/inbound/verify-email.in-port";
import { EmailQueueServicePort } from "./application/ports/outbound/email-queue.service.port";
import { HashServicePort } from "./application/ports/outbound/hash.service.port";
import { IamRepositoryPort } from "./application/ports/outbound/iam.repository.port";
import { IdGeneratorPort } from "./application/ports/outbound/id-generator.port";
import { JwtServicePort } from "./application/ports/outbound/jwt.service.port";
import { VerificationTokenGeneratorPort } from "./application/ports/outbound/verification-token-generator.port";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { LogoutUseCase } from "./application/use-cases/logout.use-case";
import { RegisterUserUseCase } from "./application/use-cases/register-user.use-case";
import { VerifyEmailUseCase } from "./application/use-cases/verify-email.use-case";
import { BcryptHashAdapter } from "./infrastructure/adapters/outbound/bcrypt-hash.adapter";
import { BullMqEmailQueueAdapter } from "./infrastructure/adapters/outbound/bullmq-email-queue.adapter";
import { NestjsJwtAdapter } from "./infrastructure/adapters/outbound/nestjs-jwt.adapter";
import { NodeCryptoAdapter } from "./infrastructure/adapters/outbound/node-crypto.adapter";
import { PrismaIamRepository } from "./infrastructure/adapters/outbound/prisma-iam.repository";
import { AuthController } from "./presentation/controllers/auth.controller";
import { ResendVerificationUseCasePort } from "./application/ports/inbound/resend-verification.in-port";
import { ResendVerificationUsecase } from "./application/use-cases/resend-verification.use-case";
import { ForgotPasswordUseCasePort } from "./application/ports/inbound/forgot-password.in-port";
import { ForgotPasswordUseCase } from "./application/use-cases/forgot-password.use-case";

@Module({
	imports: [DatabaseModule, QueueModule],
	controllers: [AuthController],
	providers: [
		{ provide: RegisterUserUseCasePort, useClass: RegisterUserUseCase },
		{ provide: VerifyEmailUseCasePort, useClass: VerifyEmailUseCase },
		{ provide: LoginUseCasePort, useClass: LoginUseCase },
		{ provide: LogoutUseCasePort, useClass: LogoutUseCase },
		{ provide: ForgotPasswordUseCasePort, useClass: ForgotPasswordUseCase },
		{ provide: ResendVerificationUseCasePort, useClass: ResendVerificationUsecase },

		{ provide: IamRepositoryPort, useClass: PrismaIamRepository },
		{ provide: HashServicePort, useClass: BcryptHashAdapter },
		{ provide: JwtServicePort, useClass: NestjsJwtAdapter },
		{ provide: IdGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: VerificationTokenGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: EmailQueueServicePort, useClass: BullMqEmailQueueAdapter },
	],
})
export class IamModule {}
