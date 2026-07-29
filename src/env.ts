import "dotenv/config";

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const nodeEnvSchema = z.enum(["development", "test", "production"]);
const emailProvider = z.enum(["nodemailer", "resend"]);

export const env = createEnv({
	server: {
		NODE_ENV: nodeEnvSchema,
		APP_NAME: z.string(),
		APP_URL: z.url(),
		PORT: z.coerce.number().default(3000),

		DATABASE_URL: z.url(),

		JWT_ACCESS_SECRET: z.string().min(128),
		JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),

		JWT_REFRESH_SECRET: z.string().min(128),
		JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

		VERIFICATION_TOKEN_EXPIRES_IN: z.string().default("24h"),
		PASSWORD_RESET_TOKEN_EXPIRES_IN: z.string().default("1h"),

		GRACE_PERIOD_ACCOUNT_DELETION: z.string().default("14d"),
		MAX_LOGIN_ATTEMPTS: z.coerce.number().default(5),
		ACCOUNT_LOCKOUT_DURATION: z.string().default("15m"),

		REDIS_URL: z.url().optional(),

		RESEND_API_KEY: z.string().optional(),

		SMTP_HOST: z.string().optional(),
		SMTP_PORT: z.coerce.number().optional(),

		SMTP_SECURE: z
			.string()
			.refine((v) => v === "true" || v === "false", {
				message: 'SMTP_SECURE must be the string "true" or "false".',
			})
			.transform((v) => v === "true")
			.optional(),

		SMTP_USER: z.string().optional(),
		SMTP_PASS: z.string().optional(),

		EMAIL_PROVIDER: emailProvider,
		FROM_EMAIL: z.string().default("onboarding@resend.dev"),

		CLOUDINARY_CLOUD_NAME: z.string(),
		CLOUDINARY_API_KEY: z.string(),
		CLOUDINARY_API_SECRET: z.string(),
	},

	runtimeEnv: process.env,

	emptyStringAsUndefined: true,

	createFinalSchema: (shape) =>
		z.object(shape).transform((env, ctx) => {
			if (env.EMAIL_PROVIDER === "resend") {
				if (!env.RESEND_API_KEY) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ["RESEND_API_KEY"],
						message: "RESEND_API_KEY is required when EMAIL_PROVIDER=resend.",
					});
				}
			}

			if (env.EMAIL_PROVIDER === "nodemailer") {
				const required = [
					"SMTP_HOST",
					"SMTP_PORT",
					"SMTP_SECURE",
					"SMTP_USER",
					"SMTP_PASS",
				] as const;

				for (const key of required) {
					if (env[key] == null) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							path: [key],
							message: `${key} is required when EMAIL_PROVIDER=nodemailer.`,
						});
					}
				}

				if (env.SMTP_PORT === 465 && env.SMTP_SECURE !== true) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ["SMTP_SECURE"],
						message: "SMTP_SECURE must be true when SMTP_PORT is 465.",
					});
				}
			}

			if (ctx.issues.length > 0) {
				return z.NEVER;
			}

			return env;
		}),
});
