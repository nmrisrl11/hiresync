export class EnqueueWelcomeEmailCommand {
	constructor(public readonly email: string) {}
}

export abstract class EnqueueWelcomeEmailUseCasePort {
	abstract execute(command: EnqueueWelcomeEmailCommand): Promise<void>;
}
