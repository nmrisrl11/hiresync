export abstract class EmailProviderPort {
	abstract sendEmail(options: {
		to: string;
		subject: string;
		template: string;
		context: Record<string, unknown>;
	}): Promise<void>;
}
