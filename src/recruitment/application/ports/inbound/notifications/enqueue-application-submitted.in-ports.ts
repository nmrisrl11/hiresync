export class EnqueueApplicationSubmittedCommand {
	constructor(
		public readonly applicationId: string,
		public readonly applicantId: string,
		public readonly jobListingId: string,
		public readonly employerId: string,
	) {}
}

export abstract class EnqueueApplicationSubmittedUseCasePort {
	abstract execute(command: EnqueueApplicationSubmittedCommand): Promise<void>;
}
