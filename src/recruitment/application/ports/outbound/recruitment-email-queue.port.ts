export abstract class RecruitmentEmailQueuePort {
	abstract enqueueEmployerWelcomeEmail(email: string, companyName: string): Promise<void>;

	abstract enqueueJobCreatedEmail(
		email: string,
		companyName: string,
		jobTitle: string,
	): Promise<void>;

	abstract enqueueJobClosedEmail(
		email: string,
		companyName: string,
		jobTitle: string,
		reason: string,
	): Promise<void>;

	abstract enqueueApplicantWelcomeEmail(
		email: string,
		firstName: string,
		lastName: string,
	): Promise<void>;
}
