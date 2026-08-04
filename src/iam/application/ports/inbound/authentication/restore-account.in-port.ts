export class RestoreAccountCommand {
	constructor(
		public readonly email: string,
		public readonly password: string,
		public readonly userAgent: string | null = null,
		public readonly ipAddress: string | null = null,
	) {}
}

export type RestoreAccountResult = {
	accessToken: string;
	refreshToken: string;
};

export abstract class RestoreAccountUseCasePort {
	abstract execute(command: RestoreAccountCommand): Promise<RestoreAccountResult>;
}
