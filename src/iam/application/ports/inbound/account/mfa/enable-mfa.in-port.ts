export class EnableMfaCommand {
	constructor(
		public readonly userId: string,
		public readonly code: string, //! 6-digit code from authenticator app
	) {}
}

export type EnableMfaResult = {
	backupCodes: string[]; //! Plaintext codes shown ONCE to the user
};

export abstract class EnableMfaUseCasePort {
	abstract execute(command: EnableMfaCommand): Promise<EnableMfaResult>;
}
