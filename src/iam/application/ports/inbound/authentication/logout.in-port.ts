export class LogoutCommand {
	constructor(public readonly userId: string) {}
}

export abstract class LogoutUseCasePort {
	abstract execute(command: LogoutCommand): Promise<void>;
}
