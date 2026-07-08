import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { IamModule } from "./iam/iam.module";
import { DatabaseModule } from "./shared/database/database.module";
import { EmailModule } from "./shared/email/email.module";
import { QueueModule } from "./shared/queue/queue.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		DatabaseModule,
		IamModule,
		EmailModule,
		QueueModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
