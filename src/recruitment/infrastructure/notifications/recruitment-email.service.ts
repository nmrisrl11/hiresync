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

	public async sendApplicantWelcomeEmail(
		email: string,
		firstName: string,
		lastName: string,
	): Promise<void> {
		const jobsUrl = `${this.appUrl}/jobs`;

		await this.mailer.sendEmail({
			to: email,
			subject: "Welcome to your Applicant Profile!",
			template: "recruitment/applicant-welcome",
			context: { jobsUrl, firstName, lastName },
		});
	}

	public async sendApplicationSubmittedEmail(
		email: string,
		applicantName: string,
		jobTitle: string,
		companyName: string,
	): Promise<void> {
		const applicationsUrl = `${this.appUrl}/applicant/applications`;

		await this.mailer.sendEmail({
			to: email,
			subject: `Application Submitted: ${jobTitle} at ${companyName}`,
			template: "recruitment/application-submitted",
			context: { applicationsUrl, applicantName, jobTitle, companyName },
		});
	}

	public async sendApplicationReceivedEmail(
		email: string,
		companyName: string,
		applicantName: string,
		jobTitle: string,
	): Promise<void> {
		const employerApplicationsUrl = `${this.appUrl}/employer/applications`;

		await this.mailer.sendEmail({
			to: email,
			subject: `New Application Received for ${jobTitle}`,
			template: "recruitment/application-received",
			context: { employerApplicationsUrl, companyName, applicantName, jobTitle },
		});
	}

	public async sendApplicationStatusUpdatedEmail(
		email: string,
		applicantName: string,
		jobTitle: string,
		companyName: string,
		newStatus: string,
	): Promise<void> {
		const applicationsUrl = `${this.appUrl}/applicant/applications`;

		await this.mailer.sendEmail({
			to: email,
			subject: `Application Update: ${jobTitle} at ${companyName}`,
			template: "recruitment/application-status-updated",
			context: { applicationsUrl, applicantName, jobTitle, companyName, newStatus },
		});
	}
}
