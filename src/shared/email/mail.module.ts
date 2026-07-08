import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/adapters/handlebars.adapter";
import { join } from "path";
import { env } from "@/env";

@Module({
	imports: [
		MailerModule.forRoot({
			transport: {
				host: env.SMTP_HOST,
				port: env.SMTP_PORT,
				secure: env.SMTP_SECURE,
				auth: {
					user: env.SMTP_USER,
					pass: env.SMTP_PASS,
				},
			},
			defaults: {
				from: `"no-reply" <${env.FROM_EMAIL}>`, //! Change the no-reply here to your appy name
			},
			template: {
				dir: join(__dirname, "templates"), //! Look for templates in this directory
				adapter: new HandlebarsAdapter(),
				options: {
					strict: true,
				},
			},
		}),
	],
	exports: [MailerModule],
})
export class MailModule {}
