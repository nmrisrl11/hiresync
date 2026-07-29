export class RevokeAllOtherSessionsCommand {
	constructor(
		public readonly userId: string,
		public readonly currentSessionId: string,
	) {}
}

export abstract class RevokeAllOtherSessionsUseCasePort {
	abstract execute(command: RevokeAllOtherSessionsCommand): Promise<void>;
}
