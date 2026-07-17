import { EmailService } from "@/shared/email/email.service";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import {
	EmailChangedAlertSchema,
	EmailJobPayload,
	PasswordChangedAlertSchema,
	SendChangeEmailRequestSchema,
	SendPasswordResetSchema,
	SendVerificationSchema,
} from "../types/email.types";

@Processor("email")
export class EmailProcessor extends WorkerHost {
	private readonly logger = new Logger(EmailProcessor.name);

	constructor(private readonly emailService: EmailService) {
		super();
	}

	//! This method automatically triggers when a new job hits the "email" queue
	async process(job: Job<EmailJobPayload>): Promise<void> {
		this.logger.log(`Processing job ${job.id} of type ${job.name}...`);

		try {
			switch (job.name) {
				case "send-verification": {
					const payload = SendVerificationSchema.parse(job.data);

					await this.emailService.sendVerificationEmail(
						payload.email,
						payload.token,
						payload.expiresInText ?? "24 hours",
					);

					break;
				}
				case "send-password-reset": {
					const payload = SendPasswordResetSchema.parse(job.data);

					await this.emailService.sendPasswordResetEmail(
						payload.email,
						payload.token,
						payload.expiresInText,
					);

					break;
				}
				case "send-change-email": {
					const payload = SendChangeEmailRequestSchema.parse(job.data);

					await this.emailService.sendChangeEmailRequestEmail(
						payload.email,
						payload.token,
						payload.expiresInText,
					);

					break;
				}
				case "send-password-changed-alert": {
					const payload = PasswordChangedAlertSchema.parse(job.data);

					await this.emailService.sendPasswordChangedAlertEmail(payload.email);

					break;
				}
				case "send-email-changed-alert": {
					const payload = EmailChangedAlertSchema.parse(job.data);

					await this.emailService.sendEmailChangedAlertEmail(payload.oldEmail, payload.newEmail);

					break;
				}
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
