export class EnqueuePasswordChangedAlertCommand {
	constructor(public readonly email: string) {}
}

export abstract class EnqueuePasswordChangedAlertUseCasePort {
	abstract execute(command: EnqueuePasswordChangedAlertCommand): Promise<void>;
}

export class EnqueueEmailChangedAlertCommand {
	constructor(
		public readonly oldEmail: string,
		public readonly newEmail: string,
	) {}
}

export abstract class EnqueueEmailChangedAlertUseCasePort {
	abstract execute(command: EnqueueEmailChangedAlertCommand): Promise<void>;
}
