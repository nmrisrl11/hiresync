export class EnqueuePasswordChangedAlertCommand {
	constructor(public readonly email: string) {}
}

export abstract class EnqueuePasswordChangedAlertUseCasePort {
	abstract execute(command: EnqueuePasswordChangedAlertCommand): Promise<void>;
}
