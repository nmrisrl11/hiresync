import { env } from "@/env";
import { EmailProviderPort } from "@/shared/email/ports/email-provider.port";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RecruitmentEmailService {
	constructor(private readonly mailer: EmailProviderPort) {}

	private readonly appUrl = env.APP_URL;

	public async sendEmployerWelcomeEmail(email: string, companyName: string): Promise<void> {
		const dashboardUrl = `${this.appUrl}/employer/dashboard`;

		await this.mailer.sendEmail({
			to: email,
			subject: "Welcome to the Employer Portal!",
			template: "recruitment/employer-welcome",
			context: { dashboardUrl, companyName },
		});
	}

	public async sendJobListingCreatedEmail(
		email: string,
		companyName: string,
		jobTitle: string,
	): Promise<void> {
		const jobsUrl = `${this.appUrl}/employer/jobs`;

		await this.mailer.sendEmail({
			to: email,
			subject: `Job Posted: ${jobTitle}`,
			template: "recruitment/job-created",
			context: { jobsUrl, companyName, jobTitle },
		});
	}

	public async sendJobListingClosedEmail(
		email: string,
		companyName: string,
		jobTitle: string,
		reason: string,
	): Promise<void> {
		const jobsUrl = `${this.appUrl}/employer/jobs`;

		await this.mailer.sendEmail({
			to: email,
			subject: `Job Closed: ${jobTitle}`,
			template: "recruitment/job-closed",
			context: { jobsUrl, companyName, jobTitle, reason },
		});
	}
}
