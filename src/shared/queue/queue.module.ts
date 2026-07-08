import { env } from "@/env";
import { BullModule, getQueueToken } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { EmailModule } from "../email/email.module";
import { EmailProcessor } from "./processors/email.processor";

const hasRedis = !!env.REDIS_URL;

@Module({
	imports: [
		...(hasRedis
			? [
					//! Establish the connection to Redis (Upstash or Local)
					BullModule.forRoot({ connection: { url: env.REDIS_URL } }),

					//! Register a specific queue named "email"
					BullModule.registerQueue({ name: "email" }),
				]
			: []),

		EmailModule, //! Import the EmailModule to be used by EmailProcessor
	],
	providers: [
		...(hasRedis ? [EmailProcessor] : []), //! Only boot the processor if we have Redis

		...(!hasRedis
			? [
					{
						provide: getQueueToken("email"),
						useValue: {
							add: (jobName: string) => {
								throw new Error(`Redis is disabled. Cannot enqueue '${jobName}'.`);
							},
						},
					},
				]
			: []), //! Provide a mock queue if Redis is missing
	],
	exports: [hasRedis ? BullModule : getQueueToken("email")],
})
export class QueueModule {}
