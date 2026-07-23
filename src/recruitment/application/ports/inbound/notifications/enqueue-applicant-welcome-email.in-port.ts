export class EnqueueApplicantWelcomeEmailCommand {
	constructor(
		public readonly applicantId: string,
		public readonly firstName: string,
		public readonly lastName: string,
	) {}
}

export abstract class EnqueueApplicantWelcomeEmailUseCasePort {
	abstract execute(command: EnqueueApplicantWelcomeEmailCommand): Promise<void>;
}
