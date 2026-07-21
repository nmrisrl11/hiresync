export class EnqueueJobCreatedEmailCommand {
	constructor(
		public readonly employerId: string,
		public readonly jobTitle: string,
	) {}
}

export abstract class EnqueueJobCreatedEmailUseCasePort {
	abstract execute(command: EnqueueJobCreatedEmailCommand): Promise<void>;
}
