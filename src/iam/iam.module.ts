import { DatabaseModule } from "@/shared/database/database.module";
import { QueueModule } from "@/shared/queue/queue.module";
import { Module } from "@nestjs/common";
import { LoginUserUseCasePort } from "./application/ports/inbound/login-user.in-port";
import { LogoutUseCasePort } from "./application/ports/inbound/logout.in-port";
import { RegisterUserUseCasePort } from "./application/ports/inbound/register-user.in-port";
import { VerifyEmailUseCasePort } from "./application/ports/inbound/verify-email.in-port";
import { EmailQueueServicePort } from "./application/ports/outbound/email-queue.service.port";
import { HashServicePort } from "./application/ports/outbound/hash.service.port";
import { IamRepositoryPort } from "./application/ports/outbound/iam.repository.port";
import { IdGeneratorPort } from "./application/ports/outbound/id-generator.port";
import { JwtServicePort } from "./application/ports/outbound/jwt.service.port";
import { VerificationTokenGeneratorPort } from "./application/ports/outbound/verification-token-generator.port";
import { LoginUserUseCase } from "./application/use-cases/login-user.use-case";
import { LogoutUseCase } from "./application/use-cases/logout.use-case";
import { RegisterUserUseCase } from "./application/use-cases/register-user.use-case";
import { VerifyEmailUseCase } from "./application/use-cases/verify-email.use-case";
import { BcryptHashAdapter } from "./infrastructure/adapters/outbound/bcrypt-hash.adapter";
import { BullMqEmailQueueAdapter } from "./infrastructure/adapters/outbound/bullmq-email-queue.adapter";
import { NestjsJwtAdapter } from "./infrastructure/adapters/outbound/nestjs-jwt.adapter";
import { NodeCryptoAdapter } from "./infrastructure/adapters/outbound/node-crypto.adapter";
import { PrismaIamRepository } from "./infrastructure/adapters/outbound/prisma-iam.repository";
import { AuthController } from "./presentation/controllers/auth.controller";

@Module({
	imports: [DatabaseModule, QueueModule],
	controllers: [AuthController],
	providers: [
		{ provide: RegisterUserUseCasePort, useClass: RegisterUserUseCase },
		{ provide: VerifyEmailUseCasePort, useClass: VerifyEmailUseCase },
		{ provide: LoginUserUseCasePort, useClass: LoginUserUseCase },
		{ provide: LogoutUseCasePort, useClass: LogoutUseCase },

		{ provide: IamRepositoryPort, useClass: PrismaIamRepository },
		{ provide: HashServicePort, useClass: BcryptHashAdapter },
		{ provide: JwtServicePort, useClass: NestjsJwtAdapter },
		{ provide: IdGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: VerificationTokenGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: EmailQueueServicePort, useClass: BullMqEmailQueueAdapter },
	],
})
export class IamModule {}
