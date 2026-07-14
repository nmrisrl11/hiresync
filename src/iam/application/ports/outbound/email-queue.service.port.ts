export abstract class EmailQueueServicePort {
	abstract enqueueVerificationEmail(
		email: string,
		token: string,
		expiresInText: string,
	): Promise<void>;

	abstract enqueuePasswordResetEmail(
		email: string,
		token: string,
		expiresInText: string,
	): Promise<void>;

	abstract enqueueChangeEmailRequestEmail(
		email: string,
		token: string,
		expiresInText: string,
	): Promise<void>;
}
