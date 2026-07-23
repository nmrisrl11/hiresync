export class ApplyForJobCommand {
	constructor(
		public readonly applicantId: string,
		public readonly jobListingId: string,
		public readonly resumeUrl: string,
		public readonly coverLetterUrl: string | null,
	) {}
}

export abstract class ApplyForJobUseCasePort {
	abstract execute(command: ApplyForJobCommand): Promise<string>;
}
