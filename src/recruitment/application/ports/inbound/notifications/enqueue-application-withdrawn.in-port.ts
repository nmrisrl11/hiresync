export class EnqueueApplicationWithdrawnCommand {
	constructor(
		public readonly applicationId: string,
		public readonly applicantId: string,
		public readonly jobListingId: string,
		public readonly employerId: string,
	) {}
}

export abstract class EnqueueApplicationWithdrawnUseCasePort {
	abstract execute(command: EnqueueApplicationWithdrawnCommand): Promise<void>;
}
