import { env } from "@/env";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";

export const hasRedis = !!env.REDIS_URL;

@Module({
	imports: [...(hasRedis ? [BullModule.forRoot({ connection: { url: env.REDIS_URL } })] : [])],
	exports: [...(hasRedis ? [BullModule] : [])],
})
export class QueueModule {}
