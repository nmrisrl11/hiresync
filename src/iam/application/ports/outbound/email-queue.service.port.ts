export abstract class EmailQueueServicePort {
	abstract enqueueVerificationEmail(email: string, token: string): Promise<boolean>;
	abstract enqueuePasswordResetEmail(email: string, token: string): Promise<boolean>;
}
