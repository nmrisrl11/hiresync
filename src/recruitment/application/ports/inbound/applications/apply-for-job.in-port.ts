export class ApplyForJobCommand {
	constructor(
		public readonly applicantUserId: string,
		public readonly jobListingId: string,
		public readonly resumeDocumentId: string,
		public readonly coverLetterDocumentId?: string,
	) {}
}

export abstract class ApplyForJobUseCasePort {
	abstract execute(command: ApplyForJobCommand): Promise<string>;
}
