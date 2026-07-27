export class EnqueueAccountRestoredEmailCommand {
	constructor(public readonly email: string) {}
}

export abstract class EnqueueAccountRestoredEmailUseCasePort {
	abstract execute(command: EnqueueAccountRestoredEmailCommand): Promise<void>;
}
