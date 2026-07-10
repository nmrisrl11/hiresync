export abstract class EmailQueueServicePort {
	abstract enqueueVerificationEmail(email: string, token: string): Promise<void>;
	abstract enqueuePasswordResetEmail(email: string, token: string): Promise<void>;
}
