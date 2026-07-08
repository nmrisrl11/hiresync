import { EmailQueueServicePort } from "@/iam/application/ports/outbound/email-queue.service.port";
import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class BullMqEmailQueueAdapter implements EmailQueueServicePort {
	private readonly logger = new Logger(BullMqEmailQueueAdapter.name);

	constructor(@InjectQueue("email") private readonly emailQueue: Queue) {}

	public async enqueueVerificationEmail(email: string, token: string): Promise<boolean> {
		try {
			await this.emailQueue.add(
				"send-verification",
				{ email, token },
				{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
			);
			return true;
		} catch (error) {
			this.logger.error(`BullMQ enqueue failed for ${email}`, error);
			return false;
		}
	}
}
