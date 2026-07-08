import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { EmailProviderPort } from "./ports/email-provider.port";
import { NodemailerAdapter } from "./adapters/nodemailer.adapter";
import { MailModule } from "./mail.module";
// Import ResendAdapter when you implement it

const isNodemailer = process.env.EMAIL_PROVIDER === "nodemailer";

@Module({
	imports: isNodemailer ? [MailModule] : [],
	providers: [
		EmailService,
		{
			provide: EmailProviderPort,
			useClass: isNodemailer ? NodemailerAdapter : NodemailerAdapter, // Swap second one for ResendAdapter
		},
	],
	exports: [EmailService],
})
export class EmailModule {}
