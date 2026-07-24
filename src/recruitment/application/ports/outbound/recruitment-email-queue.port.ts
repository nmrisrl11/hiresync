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

	abstract enqueueApplicationSubmittedEmail(
		email: string,
		applicantName: string,
		jobTitle: string,
		companyName: string,
	): Promise<void>;

	abstract enqueueApplicationReceivedEmail(
		email: string,
		companyName: string,
		applicantName: string,
		jobTitle: string,
	): Promise<void>;

	abstract enqueueApplicationStatusUpdatedEmail(
		email: string,
		applicantName: string,
		jobTitle: string,
		companyName: string,
		newStatus: string,
	): Promise<void>;
}
