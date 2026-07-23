export class ApplyForJobCommand {
	constructor(
		public readonly applicantId: string,
		public readonly jobListingId: string,
		public readonly resumeBuffer: Buffer,
		public readonly coverLetterBuffer?: Buffer,
	) {}
}

export abstract class ApplyForJobUseCasePort {
	abstract execute(command: ApplyForJobCommand): Promise<string>;
}
