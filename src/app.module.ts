import { SharedModule } from "./shared/shared.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { IamModule } from "./iam/iam.module";
import { JwtAuthGuard } from "./iam/presentation/guards/jwt-auth.guard";
import { DatabaseModule } from "./shared/database/database.module";
import { EmailModule } from "./shared/email/email.module";
import { QueueModule } from "./shared/queue/queue.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { RolesGuard } from "./iam/presentation/guards/roles.guard";
import { EventEmitterModule } from "@nestjs/event-emitter";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ThrottlerModule.forRoot([
			{
				name: "short",
				ttl: 1000,
				limit: 3,
			},
			{
				name: "medium",
				ttl: 10000,
				limit: 20,
			},
		]),
		EventEmitterModule.forRoot(),
		DatabaseModule,
		JwtModule.register({ global: true }),
		SharedModule,
		IamModule,
		EmailModule,
		QueueModule,
	],
	providers: [
		{ provide: APP_GUARD, useClass: ThrottlerGuard },
		{ provide: APP_GUARD, useClass: JwtAuthGuard },
		{ provide: APP_GUARD, useClass: RolesGuard },
	],
})
export class AppModule {}
