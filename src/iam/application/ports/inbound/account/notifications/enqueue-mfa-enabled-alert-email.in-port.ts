export class EnqueueMfaEnabledAlertEmailCommand {
	constructor(public readonly email: string) {}
}

export abstract class EnqueueMfaEnabledAlertEmailUseCasePort {
	abstract execute(command: EnqueueMfaEnabledAlertEmailCommand): Promise<void>;
}
