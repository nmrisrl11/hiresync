export class ChangePasswordCommand {
	constructor(
		public readonly userId: string,
		public readonly currentPassword: string,
		public readonly newPassword: string,
	) {}
}

export abstract class ChangePasswordUseCasePort {
	abstract execute(command: ChangePasswordCommand): Promise<void>;
}
