export class LogoutCommand {
	constructor(
		public readonly userId: string,
		public readonly sessionId: string,
	) {}
}

export abstract class LogoutUseCasePort {
	abstract execute(command: LogoutCommand): Promise<void>;
}
