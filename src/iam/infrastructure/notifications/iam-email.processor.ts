import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { IamEmailService } from "./iam-email.service";
import {
	EmailChangedAlertSchema,
	FarewellEmailSchema,
	IamEmailJobPayload,
	PasswordChangedAlertSchema,
	SendChangeEmailRequestSchema,
	SendPasswordResetSchema,
	SendVerificationSchema,
	WelcomeEmailSchema,
} from "./iam-email.types";

@Processor("iam-email")
export class IamEmailProcessor extends WorkerHost {
	constructor(
		private readonly emailService: IamEmailService,
		private readonly logger: LoggerPort,
	) {
		super();
	}

	//! This method automatically triggers when a new job hits the "iam-email" queue
	async process(job: Job<IamEmailJobPayload>): Promise<void> {
		this.logger.log(`Processing IAM job ${job.id} of type ${job.name}...`);

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
				case "send-welcome-email": {
					const payload = WelcomeEmailSchema.parse(job.data);
					await this.emailService.sendWelcomeEmail(payload.email);
					break;
				}
				case "send-farewell-email": {
					const payload = FarewellEmailSchema.parse(job.data);
					await this.emailService.sendFarewellEmail(payload.email);
					break;
				}
				default:
					throw new Error(`Unknown IAM job type: ${job.name}`);
			}

			this.logger.log(`IAM Job ${job.id} completed successfully.`);
		} catch (error) {
			this.logger.error(
				`Failed to process IAM job ${job.id}:`,
				error instanceof Error ? error.stack : "Unknown error",
			);
			throw error;
		}
	}
}
