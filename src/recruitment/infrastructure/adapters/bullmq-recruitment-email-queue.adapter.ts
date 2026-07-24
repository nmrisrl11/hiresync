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
		console.log(email, companyName, jobTitle, reason);
		await this.emailQueue.add(
			"send-job-closed",
			{ email, companyName, jobTitle, reason },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}

	public async enqueueApplicantWelcomeEmail(
		email: string,
		firstName: string,
		lastName: string,
	): Promise<void> {
		await this.emailQueue.add(
			"send-applicant-welcome",
			{ email, firstName, lastName },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}

	public async enqueueApplicationSubmittedEmail(
		email: string,
		applicantName: string,
		jobTitle: string,
		companyName: string,
	): Promise<void> {
		await this.emailQueue.add(
			"send-application-submitted",
			{ email, applicantName, jobTitle, companyName },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}

	public async enqueueApplicationReceivedEmail(
		email: string,
		companyName: string,
		applicantName: string,
		jobTitle: string,
	): Promise<void> {
		await this.emailQueue.add(
			"send-application-received",
			{ email, companyName, applicantName, jobTitle },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}

	public async enqueueApplicationStatusUpdatedEmail(
		email: string,
		applicantName: string,
		jobTitle: string,
		companyName: string,
		newStatus: string,
	): Promise<void> {
		await this.emailQueue.add(
			"send-application-status-updated",
			{ email, applicantName, jobTitle, companyName, newStatus },
			{ attempts: 3, backoff: { type: "exponential", delay: 2000 } },
		);
	}
}
