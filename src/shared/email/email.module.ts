import { Module } from "@nestjs/common";
import { NodemailerAdapter } from "./adapters/nodemailer.adapter";
import { ResendAdapter } from "./adapters/resend.adapter";
import { MailModule } from "./mail.module";
import { EmailProviderPort } from "./ports/email-provider.port";

const isNodemailer = process.env.EMAIL_PROVIDER === "nodemailer";

@Module({
	imports: isNodemailer ? [MailModule] : [],
	providers: [
		{ provide: EmailProviderPort, useClass: isNodemailer ? NodemailerAdapter : ResendAdapter },
	],
	exports: [EmailProviderPort],
})
export class EmailModule {}
