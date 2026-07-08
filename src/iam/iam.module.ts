import { DatabaseModule } from "@/shared/database/database.module";
import { Module } from "@nestjs/common";
import { RegisterUserUseCasePort } from "./application/ports/inbound/register-user.in-port";
import { HashPasswordServicePort } from "./application/ports/outbound/hash-password.service.port";
import { IamRepositoryPort } from "./application/ports/outbound/iam.repository.port";
import { RegisterUserUseCase } from "./application/use-cases/register-user.use-case";
import { BcryptHashPasswordAdapter } from "./infrastructure/adapters/outbound/bcrypt-hash-password.adapter";
import { PrismaIamRepository } from "./infrastructure/adapters/outbound/prisma-iam.repository";
import { AuthController } from "./presentation/controllers/auth.controller";
import { IdGeneratorPort } from "./application/ports/outbound/id-generator.port";
import { NodeCryptoAdapter } from "./infrastructure/adapters/outbound/node-crypto.adapter";
import { VerificationTokenGeneratorPort } from "./application/ports/outbound/verification-token-generator.port";
import { EmailQueueServicePort } from "./application/ports/outbound/email-queue.service.port";
import { BullMqEmailQueueAdapter } from "./infrastructure/adapters/outbound/bullmq-email-queue.adapter";
import { env } from "@/env";
import { BullModule } from "@nestjs/bullmq";

const hasRedis = !!env.REDIS_URL;

@Module({
	imports: [
		...(hasRedis
			? [
					BullModule.forRoot({ connection: { url: env.REDIS_URL } }),
					BullModule.registerQueue({ name: "email" }),
				]
			: []),
		DatabaseModule,
	],
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
