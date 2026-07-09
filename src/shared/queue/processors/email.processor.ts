import { EmailService } from "@/shared/email/email.service";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { EmailJobPayload, EmailJobPayloadSchema } from "../types/email.types";

@Processor("email")
export class EmailProcessor extends WorkerHost {
	private readonly logger = new Logger(EmailProcessor.name);

	constructor(private readonly emailService: EmailService) {
		super();
	}

	//! This method automatically triggers when a new job hits the "email" queue
	async process(job: Job<EmailJobPayload>): Promise<void> {
		const result = EmailJobPayloadSchema.safeParse(job.data);

		if (!result.success) {
			this.logger.error(`Invalid payload for job ${job.id}: ${result.error.message}`);
			throw new Error("Invalid job payload");
		}

		const { email, token } = result.data;

		this.logger.log(`Processing job ${job.id} of type ${job.name} for ${email}...`);

		try {
			switch (job.name) {
				case "send-verification":
					await this.emailService.sendVerificationEmail(email, token);
					break;
				case "send-password-reset":
					await this.emailService.sendPasswordResetEmail(email, token);
					break;
				default:
					throw new Error(`Unknown job type: ${job.name}`);
			}

			this.logger.log(`Job ${job.id} completed successfully.`);
		} catch (error) {
			this.logger.error(`Failed to process job ${job.id}:`, error);
			throw error;
		}
	}
}
