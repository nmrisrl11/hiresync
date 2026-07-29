export class LoginCommand {
	constructor(
		public readonly email: string,
		public readonly password: string,
		public readonly userAgent: string | null = null,
		public readonly ipAddress: string | null = null,
	) {}
}

export type LoginResult = {
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		email: string;
		name: string;
		role: string;
	};
};

export abstract class LoginUseCasePort {
	abstract execute(command: LoginCommand): Promise<LoginResult>;
}
