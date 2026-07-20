export abstract class RecruitmentEmailQueuePort {
	abstract enqueueEmployerWelcomeEmail(email: string, companyName: string): Promise<void>;

	abstract enqueueJobCreatedEmail(
		email: string,
		companyName: string,
		jobTitle: string,
	): Promise<void>;
}
