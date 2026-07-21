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

export type RecruitmentEmailJobPayload =
	z.infer<typeof EmployerWelcomeEmailSchema> | z.infer<typeof JobCreatedEmailSchema>;
