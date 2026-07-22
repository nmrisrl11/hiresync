import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { RecruitmentEmailService } from "./recruitment-email.service";
import {
	EmployerWelcomeEmailSchema,
	JobClosedEmailSchema,
	JobCreatedEmailSchema,
	RecruitmentEmailJobPayload,
} from "./recruitment-email.types";

@Processor("recruitment-email")
export class RecruitmentEmailProcessor extends WorkerHost {
	private readonly logger = new Logger(RecruitmentEmailProcessor.name);

	constructor(private readonly emailService: RecruitmentEmailService) {
		super();
	}

	public async process(job: Job<RecruitmentEmailJobPayload>): Promise<void> {
		this.logger.log(`Processing Recruitment job ${job.id} of type ${job.name}...`);

		try {
			switch (job.name) {
				case "send-employer-welcome": {
					const payload = EmployerWelcomeEmailSchema.parse(job.data);
					await this.emailService.sendEmployerWelcomeEmail(payload.email, payload.companyName);
					break;
				}
				case "send-job-created": {
					const payload = JobCreatedEmailSchema.parse(job.data);
					await this.emailService.sendJobListingCreatedEmail(
						payload.email,
						payload.companyName,
						payload.jobTitle,
					);
					break;
				}
				case "send-job-closed": {
					const payload = JobClosedEmailSchema.parse(job.data);
					await this.emailService.sendJobListingClosedEmail(
						payload.email,
						payload.companyName,
						payload.jobTitle,
						payload.reason,
					);
					break;
				}
				default:
					throw new Error(`Unknown Recruitment job type: ${job.name}`);
			}
			this.logger.log(`Recruitment Job ${job.id} completed successfully.`);
		} catch (error) {
			this.logger.error(`Failed to process Recruitment job ${job.id}:`, error);
			throw error;
		}
	}
}
