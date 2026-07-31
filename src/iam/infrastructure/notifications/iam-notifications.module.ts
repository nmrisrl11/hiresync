import { EmailModule } from "@/shared/email/email.module";
import { hasRedis, QueueModule } from "@/shared/queue/queue.module";
import { BullModule, getQueueToken } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { IamEmailProcessor } from "./iam-email.processor";
import { IamEmailService } from "./iam-email.service";

@Module({
	imports: [
		QueueModule,
		EmailModule,
		...(hasRedis
			? [
					BullModule.registerQueue({
						name: "iam-email",
						defaultJobOptions: {
							attempts: 3,
							backoff: { type: "exponential", delay: 2000 },
							removeOnComplete: true,
							removeOnFail: false,
						},
					}),
				]
			: []), //! Register a specific queue named "iam-email"
	],
	providers: [
		IamEmailService,
		...(hasRedis ? [IamEmailProcessor] : []), //! Only boot the processor if we have Redis
		...(!hasRedis
			? [
					{
						provide: getQueueToken("iam-email"),
						useValue: {
							add: (jobName: string) => {
								throw new Error(`Redis is disabled. Cannot enqueue IAM job '${jobName}'.`);
							},
						},
					},
				]
			: []),
	],
	exports: [hasRedis ? BullModule : getQueueToken("iam-email")],
})
export class IamNotificationsModule {}
