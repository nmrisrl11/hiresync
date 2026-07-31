import { EmailProviderPort } from "@/shared/email/ports/email-provider.port";
import { AppLinks } from "@/shared/utils/app-links";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RecruitmentEmailService {
	constructor(private readonly mailer: EmailProviderPort) {}

	public async sendEmployerWelcomeEmail(email: string, companyName: string): Promise<void> {
		await this.mailer.sendEmail({
			to: email,
			subject: "Welcome to the Employer Portal!",
			template: "recruitment/employer-welcome",
			context: { dashboardUrl: AppLinks.recruitment.employerDashboard, companyName },
		});
	}

	public async sendJobListingCreatedEmail(
		email: string,
		companyName: string,
		jobTitle: string,
	): Promise<void> {
		await this.mailer.sendEmail({
			to: email,
			subject: `Job Posted: ${jobTitle}`,
			template: "recruitment/job-created",
			context: { jobsUrl: AppLinks.recruitment.employerJobs, companyName, jobTitle },
		});
	}

	public async sendJobListingClosedEmail(
		email: string,
		companyName: string,
		jobTitle: string,
		reason: string,
	): Promise<void> {
		await this.mailer.sendEmail({
			to: email,
			subject: `Job Closed: ${jobTitle}`,
			template: "recruitment/job-closed",
			context: { jobsUrl: AppLinks.recruitment.employerJobs, companyName, jobTitle, reason },
		});
	}

	public async sendApplicantWelcomeEmail(
		email: string,
		firstName: string,
		lastName: string,
	): Promise<void> {
		await this.mailer.sendEmail({
			to: email,
			subject: "Welcome to your Applicant Profile!",
			template: "recruitment/applicant-welcome",
			context: { jobsUrl: AppLinks.recruitment.applicantJobs, firstName, lastName },
		});
	}

	public async sendApplicationSubmittedEmail(
		email: string,
		applicantName: string,
		jobTitle: string,
		companyName: string,
	): Promise<void> {
		await this.mailer.sendEmail({
			to: email,
			subject: `Application Submitted: ${jobTitle} at ${companyName}`,
			template: "recruitment/application-submitted",
			context: {
				applicationsUrl: AppLinks.recruitment.applicantApplications,
				applicantName,
				jobTitle,
				companyName,
			},
		});
	}

	public async sendApplicationReceivedEmail(
		email: string,
		companyName: string,
		applicantName: string,
		jobTitle: string,
	): Promise<void> {
		await this.mailer.sendEmail({
			to: email,
			subject: `New Application Received for ${jobTitle}`,
			template: "recruitment/application-received",
			context: {
				employerApplicationsUrl: AppLinks.recruitment.employerApplications,
				companyName,
				applicantName,
				jobTitle,
			},
		});
	}

	public async sendApplicationStatusUpdatedEmail(
		email: string,
		applicantName: string,
		jobTitle: string,
		companyName: string,
		newStatus: string,
	): Promise<void> {
		await this.mailer.sendEmail({
			to: email,
			subject: `Application Update: ${jobTitle} at ${companyName}`,
			template: "recruitment/application-status-updated",
			context: {
				applicationsUrl: AppLinks.recruitment.applicantApplications,
				applicantName,
				jobTitle,
				companyName,
				newStatus,
			},
		});
	}

	public async sendApplicationWithdrawnEmail(
		email: string,
		companyName: string,
		applicantName: string,
		jobTitle: string,
	): Promise<void> {
		await this.mailer.sendEmail({
			to: email,
			subject: `Application Withdrawn: ${applicantName} for ${jobTitle}`,
			template: "recruitment/application-withdrawn",
			context: {
				employerApplicationsUrl: AppLinks.recruitment.employerApplications,
				companyName,
				applicantName,
				jobTitle,
			},
		});
	}
}
