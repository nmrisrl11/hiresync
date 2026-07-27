export class EnqueueAccountDeletionScheduledEmailCommand {
	constructor(
		public readonly email: string,
		public readonly scheduledDate: Date,
	) {}
}

export abstract class EnqueueAccountDeletionScheduledEmailUseCasePort {
	abstract execute(command: EnqueueAccountDeletionScheduledEmailCommand): Promise<void>;
}
