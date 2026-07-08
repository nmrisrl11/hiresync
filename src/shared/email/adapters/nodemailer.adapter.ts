import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { EmailProviderPort } from "../ports/email-provider.port";

@Injectable()
export class NodemailerAdapter implements EmailProviderPort {
	constructor(private readonly mailerService: MailerService) {}

	async sendEmail(options: {
		to: string;
		subject: string;
		template: string;
		context: Record<string, unknown>;
	}): Promise<void> {
		await this.mailerService.sendMail({
			to: options.to,
			subject: options.subject,
			template: `./${options.template}`,
			context: options.context,
		});
	}
}
