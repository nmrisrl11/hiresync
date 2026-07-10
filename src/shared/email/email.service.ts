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
}
