export class RestoreAccountCommand {
	constructor(
		public readonly email: string,
		public readonly password: string,
	) {}
}

export abstract class RestoreAccountUseCasePort {
	abstract execute(
		command: RestoreAccountCommand,
	): Promise<{ accessToken: string; refreshToken: string }>;
}
