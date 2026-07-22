export class EnqueueJobClosedEmailCommand {
	constructor(
		public readonly employerId: string,
		public readonly jobListingId: string,
		public readonly reason: string,
	) {}
}

export abstract class EnqueueJobClosedEmailUseCasePort {
	abstract execute(command: EnqueueJobClosedEmailCommand): Promise<void>;
}
