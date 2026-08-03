export class SetInitialPasswordCommand {
	constructor(
		public readonly userId: string,
		public readonly newPassword: string,
	) {}
}

export abstract class SetInitialPasswordUseCasePort {
	abstract execute(command: SetInitialPasswordCommand): Promise<void>;
}
