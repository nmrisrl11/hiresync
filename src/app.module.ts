import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { IamModule } from "./iam/iam.module";
import { JwtAuthGuard } from "./iam/presentation/guards/jwt-auth.guard";
import { DatabaseModule } from "./shared/database/database.module";
import { EmailModule } from "./shared/email/email.module";
import { QueueModule } from "./shared/queue/queue.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		DatabaseModule,
		JwtModule.register({ global: true }),
		IamModule,
		EmailModule,
		QueueModule,
	],
	providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
