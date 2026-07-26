import { env } from "@/env";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs/promises";
import * as handlebars from "handlebars";
import * as path from "path";
import { Resend } from "resend";
import { EmailProviderPort } from "../ports/email-provider.port";

@Injectable()
export class ResendAdapter implements EmailProviderPort {
	constructor(private readonly logger: LoggerPort) {}

	private readonly resend = new Resend(env.RESEND_API_KEY);
	private readonly fromEmail = env.FROM_EMAIL; //! Replace this on production with your own domain

	async sendEmail(options: {
		to: string;
		subject: string;
		template: string;
		context: Record<string, unknown>;
	}): Promise<void> {
		try {
			//! Resolve the path to the template file, go up one directory to reach the 'templates' folder
			const templatePath = path.join(__dirname, "..", "templates", `${options.template}.hbs`);

			//! Read the raw Handlebars file
			const templateFile = await fs.readFile(templatePath, "utf-8");

			//! Compile the template and inject the variables (context)
			const compiledTemplate = handlebars.compile(templateFile);
			const htmlContent = compiledTemplate(options.context);

			//! Send the compiled HTML through the Resend SDK
			const { error } = await this.resend.emails.send({
				from: `no-reply <${this.fromEmail}>`, //! Change the no-reply here to your appy name
				to: options.to,
				subject: options.subject,
				html: htmlContent,
			});

			if (error) throw new Error(error.message);
		} catch (error: unknown) {
			if (error instanceof Error) {
				this.logger.error(
					`Failed to send email via Resend to ${options.to}: ${error.message}`,
					error.stack,
				);
			}

			//! Throw the error so the consumer knows the email faield to send
			throw error;
		}
	}
}
