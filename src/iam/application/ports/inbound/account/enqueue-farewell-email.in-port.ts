export class EnqueueFarewellEmailCommand {
	constructor(public readonly email: string) {}
}

export abstract class EnqueueFarewellEmailUseCasePort {
	abstract execute(command: EnqueueFarewellEmailCommand): Promise<void>;
}
