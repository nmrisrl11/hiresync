export class RevokeSessionCommand {
	constructor(
		public readonly userId: string,
		public readonly targetSessionId: string,
	) {}
}

export abstract class RevokeSessionUseCasePort {
	abstract execute(command: RevokeSessionCommand): Promise<void>;
}
