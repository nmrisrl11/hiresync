export class DisableMfaCommand {
	constructor(
		public readonly userId: string,
		public readonly currentPassword: string, //! Require password confirmation to disable MFA
	) {}
}

export abstract class DisableMfaUseCasePort {
	abstract execute(command: DisableMfaCommand): Promise<void>;
}
