export class EnqueueEmailChangedAlertCommand {
	constructor(
		public readonly oldEmail: string,
		public readonly newEmail: string,
	) {}
}

export abstract class EnqueueEmailChangedAlertUseCasePort {
	abstract execute(command: EnqueueEmailChangedAlertCommand): Promise<void>;
}
