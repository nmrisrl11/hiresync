export abstract class EmailQueueServicePort {
	abstract enqueueVerificationEmail(email: string, token: string): Promise<boolean>;
}
