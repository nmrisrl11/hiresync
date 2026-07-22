import { RecruitmentEmailQueuePort } from "@/recruitment/application/ports/outbound";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class BullMqRecruitmentEmailQueueAdapter implements RecruitmentEmailQueuePort {
	constructor(@InjectQueue("recruitment-email") private readonly emailQueue: Queue) {}

	public async enqueueEmployerWelcomeEmail(email: string, companyName: string): Promise<void> {
		await this.emailQueue.add(
			"send-employer-welcome",
			{ email, companyName },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}
	public async enqueueJobCreatedEmail(
		email: string,
		companyName: string,
		jobTitle: string,
	): Promise<void> {
		await this.emailQueue.add(
			"send-job-created",
			{ email, companyName, jobTitle },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}

	public async enqueueJobClosedEmail(
		email: string,
		companyName: string,
		jobTitle: string,
		reason: string,
	): Promise<void> {
		await this.emailQueue.add("send-job-closed", {
			email,
			companyName,
			jobTitle,
			reason,
		});
	}
}
