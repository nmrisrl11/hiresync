export class CloseJobListingCommand {
	constructor(
		public readonly userId: string,
		public readonly jobListingId: string,
		public readonly reason?: string,
	) {}
}

export abstract class CloseJobListingUseCasePort {
	abstract execute(command: CloseJobListingCommand): Promise<void>;
}
