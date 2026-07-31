import { EmailProviderPort } from "@/shared/email/ports/email-provider.port";
import { AppLinks } from "@/shared/utils/app-links";
import { Injectable } from "@nestjs/common";

@Injectable()
export class IamEmailService {
	constructor(private readonly mailer: EmailProviderPort) {}

	async sendVerificationEmail(email: string, token: string, expiresInText: string) {
		await this.mailer.sendEmail({
			to: email,
			subject: "Verify your email address",
			template: "iam/verify-email",
			context: { verificationUrl: AppLinks.iam.verifyEmail(token), expiresInText },
		});
	}

	async sendPasswordResetEmail(email: string, token: string, expiresInText: string) {
		await this.mailer.sendEmail({
			to: email,
			subject: "Reset your password",
			template: "iam/reset-password",
			context: { resetUrl: AppLinks.iam.resetPassword(token), expiresInText },
		});
	}

	async sendChangeEmailRequestEmail(email: string, token: string, expiresInText: string) {
		await this.mailer.sendEmail({
			to: email,
			subject: "Change your email address",
			template: "iam/change-email",
			context: { confirmEmailChangeUrl: AppLinks.iam.confirmEmailChange(token), expiresInText },
		});
	}

	async sendPasswordChangedAlertEmail(email: string) {
		await this.mailer.sendEmail({
			to: email,
			subject: "Security Alert: Your password was changed",
			template: "iam/password-changed-alert",
			context: { loginUrl: AppLinks.iam.login },
		});
	}

	async sendEmailChangedAlertEmail(oldEmail: string, newEmail: string) {
		await this.mailer.sendEmail({
			to: oldEmail,
			subject: "Security Alert: Your account email was changed",
			template: "iam/email-changed-alert",
			context: { newEmail, supportUrl: AppLinks.iam.support },
		});
	}

	async sendWelcomeEmail(email: string) {
		await this.mailer.sendEmail({
			to: email,
			subject: "Welcome to our platform!",
			template: "iam/welcome-email",
			context: { dashboardUrl: AppLinks.iam.dashboard },
		});
	}

	async sendFarewellEmail(email: string) {
		await this.mailer.sendEmail({
			to: email,
			subject: "Your account has been deleted",
			template: "iam/farewell-email",
			context: {},
		});
	}

	async sendAccountDeletionScheduledEmail(email: string, scheduledDateIso: string) {
		const formattedDate = new Date(scheduledDateIso).toLocaleDateString();

		await this.mailer.sendEmail({
			to: email,
			subject: "Your account is scheduled for deletion",
			template: "iam/account-deletion-scheduled",
			context: { formattedDate },
		});
	}

	async sendAccountRestoredEmail(email: string) {
		await this.mailer.sendEmail({
			to: email,
			subject: "Your account has been successfully restored",
			template: "iam/account-restored",
			context: {},
		});
	}

	async sendMfaEnabledAlertEmail(email: string) {
		await this.mailer.sendEmail({
			to: email,
			subject: "Security Alert: Two-Factor Authentication Enabled",
			template: "iam/mfa-enabled-alert",
			context: { accountSettingsUrl: AppLinks.iam.accountSecurity },
		});
	}

	async sendMfaDisabledAlertEmail(email: string) {
		await this.mailer.sendEmail({
			to: email,
			subject: "Security Alert: Two-Factor Authentication Disabled",
			template: "iam/mfa-disabled-alert",
			context: {
				accountSettingsUrl: AppLinks.iam.accountSecurity,
				supportUrl: AppLinks.iam.support,
			},
		});
	}
}
