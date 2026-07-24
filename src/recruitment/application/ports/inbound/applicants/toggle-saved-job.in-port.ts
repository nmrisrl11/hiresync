export class ToggleSavedJobCommand {
	constructor(
		public readonly userId: string,
		public readonly jobListingId: string,
	) {}
}

export abstract class ToggleSavedJobUseCasePort {
	abstract execute(command: ToggleSavedJobCommand): Promise<{ saved: boolean }>;
}
