import { EmailQueueServicePort } from "@/iam/application/ports/outbound";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class BullMqEmailQueueAdapter implements EmailQueueServicePort {
	constructor(@InjectQueue("email") private readonly emailQueue: Queue) {}

	public async enqueueVerificationEmail(
		email: string,
		token: string,
		expiresInText: string,
	): Promise<void> {
		await this.emailQueue.add(
			"send-verification",
			{ email, token, expiresInText },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}

	public async enqueuePasswordResetEmail(
		email: string,
		token: string,
		expiresInText: string,
	): Promise<void> {
		await this.emailQueue.add(
			"send-password-reset",
			{ email, token, expiresInText },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}

	public async enqueueChangeEmailRequestEmail(
		email: string,
		token: string,
		expiresInText: string,
	): Promise<void> {
		await this.emailQueue.add(
			"send-change-email",
			{ email, token, expiresInText },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}

	public async enqueuePasswordChangedAlertEmail(email: string): Promise<void> {
		await this.emailQueue.add(
			"send-password-changed-alert",
			{ email },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}

	public async enqueueEmailChangedAlertEmail(oldEmail: string, newEmail: string): Promise<void> {
		await this.emailQueue.add(
			"send-email-changed-alert",
			{ oldEmail, newEmail },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}

	public async enqueueWelcomeEmail(email: string): Promise<void> {
		await this.emailQueue.add(
			"send-welcome-email",
			{ email },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}

	public async enqueueFarewellEmail(email: string): Promise<void> {
		await this.emailQueue.add(
			"send-farewell-email",
			{ email },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}
}
