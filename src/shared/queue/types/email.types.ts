import z from "zod";

export const EmailJobPayloadSchema = z.object({
	email: z.email("Invalid email format").trim(),
	token: z.string().trim().min(1, "Token cannot be empty"),
});

export type EmailJobPayload = z.infer<typeof EmailJobPayloadSchema>;
