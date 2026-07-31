export class EnqueueMfaDisabledAlertEmailCommand {
	constructor(public readonly email: string) {}
}

export abstract class EnqueueMfaDisabledAlertEmailUseCasePort {
	abstract execute(command: EnqueueMfaDisabledAlertEmailCommand): Promise<void>;
}
