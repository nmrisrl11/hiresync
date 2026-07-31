import { EmailModule } from "@/shared/email/email.module";
import { hasRedis, QueueModule } from "@/shared/queue/queue.module";
import { BullModule, getQueueToken } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { RecruitmentEmailProcessor } from "./recruitment-email.processor";
import { RecruitmentEmailService } from "./recruitment-email.service";

@Module({
	imports: [
		QueueModule,
		EmailModule,
		...(hasRedis
			? [
					BullModule.registerQueue({
						name: "recruitment-email",
						defaultJobOptions: {
							attempts: 3,
							backoff: { type: "exponential", delay: 2000 },
							removeOnComplete: true,
							removeOnFail: false,
						},
					}),
				]
			: []),
	],
	providers: [
		RecruitmentEmailService,
		...(hasRedis ? [RecruitmentEmailProcessor] : []),
		...(!hasRedis
			? [
					{
						provide: getQueueToken("recruitment-email"),
						useValue: {
							add: (jobName: string) => {
								throw new Error(`Redis is disabled. Cannot enqueue Recruitment job '${jobName}'.`);
							},
						},
					},
				]
			: []),
	],
	exports: [hasRedis ? BullModule : getQueueToken("recruitment-email")],
})
export class RecruitmentNotificationsModule {}
