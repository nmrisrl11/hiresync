import { z } from "zod";

export const EmployerWelcomeEmailSchema = z.object({
	email: z.email().trim(),
	companyName: z.string().trim(),
});

export const JobCreatedEmailSchema = z.object({
	email: z.email().trim(),
	companyName: z.string().trim(),
	jobTitle: z.string().trim(),
});

export const JobClosedEmailSchema = z.object({
	email: z.email().trim(),
	companyName: z.string().trim(),
	jobTitle: z.string().trim(),
	reason: z.string().trim(),
});

export const ApplicantWelcomeEmailSchema = z.object({
	email: z.email().trim(),
	firstName: z.string().trim(),
	lastName: z.string().trim(),
});

export type RecruitmentEmailJobPayload =
	| z.infer<typeof EmployerWelcomeEmailSchema>
	| z.infer<typeof JobCreatedEmailSchema>
	| z.infer<typeof JobClosedEmailSchema>
	| z.infer<typeof ApplicantWelcomeEmailSchema>;
