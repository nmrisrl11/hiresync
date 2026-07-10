import { EmailQueueServicePort } from "@/iam/application/ports/outbound";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class BullMqEmailQueueAdapter implements EmailQueueServicePort {
	constructor(@InjectQueue("email") private readonly emailQueue: Queue) {}

	public async enqueueVerificationEmail(email: string, token: string): Promise<void> {
		await this.emailQueue.add(
			"send-verification",
			{ email, token },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}

	public async enqueuePasswordResetEmail(email: string, token: string): Promise<void> {
		await this.emailQueue.add(
			"send-password-reset",
			{ email, token },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}
}
