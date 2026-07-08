import { DatabaseModule } from "@/shared/database/database.module";
import { QueueModule } from "@/shared/queue/queue.module";
import { Module } from "@nestjs/common";
import { RegisterUserUseCasePort } from "./application/ports/inbound/register-user.in-port";
import { EmailQueueServicePort } from "./application/ports/outbound/email-queue.service.port";
import { HashPasswordServicePort } from "./application/ports/outbound/hash-password.service.port";
import { IamRepositoryPort } from "./application/ports/outbound/iam.repository.port";
import { IdGeneratorPort } from "./application/ports/outbound/id-generator.port";
import { VerificationTokenGeneratorPort } from "./application/ports/outbound/verification-token-generator.port";
import { RegisterUserUseCase } from "./application/use-cases/register-user.use-case";
import { BcryptHashPasswordAdapter } from "./infrastructure/adapters/outbound/bcrypt-hash-password.adapter";
import { BullMqEmailQueueAdapter } from "./infrastructure/adapters/outbound/bullmq-email-queue.adapter";
import { NodeCryptoAdapter } from "./infrastructure/adapters/outbound/node-crypto.adapter";
import { PrismaIamRepository } from "./infrastructure/adapters/outbound/prisma-iam.repository";
import { AuthController } from "./presentation/controllers/auth.controller";

@Module({
	imports: [DatabaseModule, QueueModule],
	controllers: [AuthController],
	providers: [
		{ provide: RegisterUserUseCasePort, useClass: RegisterUserUseCase },
		{ provide: IamRepositoryPort, useClass: PrismaIamRepository },
		{ provide: HashPasswordServicePort, useClass: BcryptHashPasswordAdapter },
		{ provide: IdGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: VerificationTokenGeneratorPort, useClass: NodeCryptoAdapter },
		{ provide: EmailQueueServicePort, useClass: BullMqEmailQueueAdapter },
	],
})
export class IamModule {}
