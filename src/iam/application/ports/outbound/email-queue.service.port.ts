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

	abstract enqueuePasswordChangedAlertEmail(email: string): Promise<void>;

	abstract enqueueEmailChangedAlertEmail(oldEmail: string, newEmail: string): Promise<void>;

	abstract enqueueWelcomeEmail(email: string): Promise<void>;

	abstract enqueueFarewellEmail(email: string): Promise<void>;
}
