import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerModule } from "@nestjs/throttler";
import { IamModule } from "./iam/iam.module";
import { JwtAuthGuard } from "./iam/presentation/guards/jwt-auth.guard";
import { RecruitmentModule } from "./recruitment/recruitment.module";
import { DatabaseModule } from "./shared/database/database.module";
import { EmailModule } from "./shared/email/email.module";
import { RolesGuard } from "./shared/presentation/guards/roles.guard";
import { UserThrottlerGuard } from "./shared/presentation/guards/user-throttler.guard";
import { QueueModule } from "./shared/queue/queue.module";
import { SharedModule } from "./shared/shared.module";

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
		RecruitmentModule,
		EmailModule,
		QueueModule,
	],
	providers: [
		{ provide: APP_GUARD, useClass: JwtAuthGuard },
		{ provide: APP_GUARD, useClass: UserThrottlerGuard },
		{ provide: APP_GUARD, useClass: RolesGuard },
	],
})
export class AppModule {}
