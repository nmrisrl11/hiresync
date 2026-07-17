import { z } from "zod";

export const SendVerificationSchema = z.object({
	email: z.email().trim(),
	token: z.string().trim(),
	expiresInText: z.string(),
});

export const SendPasswordResetSchema = z.object({
	email: z.email().trim(),
	token: z.string().trim(),
	expiresInText: z.string(),
});

export const SendChangeEmailRequestSchema = z.object({
	email: z.email().trim(),
	token: z.string().trim(),
	expiresInText: z.string(),
});

export const PasswordChangedAlertSchema = z.object({
	email: z.email().trim(),
});

export const EmailChangedAlertSchema = z.object({
	oldEmail: z.email().trim(),
	newEmail: z.email().trim(),
});

export type EmailJobPayload =
	| z.infer<typeof SendVerificationSchema>
	| z.infer<typeof SendPasswordResetSchema>
	| z.infer<typeof SendChangeEmailRequestSchema>
	| z.infer<typeof PasswordChangedAlertSchema>
	| z.infer<typeof EmailChangedAlertSchema>;
