import { Injectable } from "@nestjs/common";
import { EmailProviderPort } from "./ports/email-provider.port";
import { env } from "@/env";

@Injectable()
export class EmailService {
	constructor(private readonly mailer: EmailProviderPort) {}

	private readonly appUrl = env.APP_URL;

	async sendVerificationEmail(email: string, token: string, expiresInText: string) {
		const verificationUrl = `${this.appUrl}/api/auth/verify-email?token=${token}`;

		await this.mailer.sendEmail({
			to: email,
			subject: "Verify your email address",
			template: "verify-email",
			context: { verificationUrl, expiresInText },
		});
	}

	async sendPasswordResetEmail(email: string, token: string, expiresInText: string) {
		const resetUrl = `${this.appUrl}/api/auth/reset-password?token=${token}`;

		await this.mailer.sendEmail({
			to: email,
			subject: "Reset your password",
			template: "reset-password",
			context: { resetUrl, expiresInText },
		});
	}

	async sendChangeEmailRequestEmail(email: string, token: string, expiresInText: string) {
		const confirmEmailChangeUrl = `${this.appUrl}/api/account/change-email?token=${token}`;

		await this.mailer.sendEmail({
			to: email,
			subject: "Change your email address",
			template: "change-email",
			context: { confirmEmailChangeUrl, expiresInText },
		});
	}

	async sendPasswordChangedAlertEmail(email: string) {
		const loginUrl = `${this.appUrl}/login`;

		await this.mailer.sendEmail({
			to: email,
			subject: "Security Alert: Your password was changed",
			template: "password-changed-alert",
			context: { loginUrl },
		});
	}

	async sendEmailChangedAlertEmail(oldEmail: string, newEmail: string) {
		const supportUrl = `${this.appUrl}/support`;

		await this.mailer.sendEmail({
			to: oldEmail,
			subject: "Security Alert: Your account email was changed",
			template: "email-changed-alert",
			context: { newEmail, supportUrl },
		});
	}

	async sendWelcomeEmail(email: string) {
		const dashboardUrl = `${this.appUrl}/dashboard`;

		await this.mailer.sendEmail({
			to: email,
			subject: "Welcome to our platform!",
			template: "welcome-email",
			context: { dashboardUrl },
		});
	}

	async sendFarewellEmail(email: string) {
		await this.mailer.sendEmail({
			to: email,
			subject: "Your account has been deleted",
			template: "farewell-email",
			context: {},
		});
	}
}
