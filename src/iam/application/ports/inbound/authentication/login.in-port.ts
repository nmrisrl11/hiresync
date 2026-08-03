export class LoginCommand {
	constructor(
		public readonly email: string,
		public readonly password: string,
		public readonly userAgent: string | null = null,
		public readonly ipAddress: string | null = null,
	) {}
}

export type LoginResult = {
	mfaRequired: boolean;
	mfaChallengeToken?: string; //! Issued ONLY if mfaRequired === true
	accessToken?: string; //! Issued ONLY if mfaRequired === false
	refreshToken?: string; //! Issued ONLY if mfaRequired === false
	user?: {
		id: string;
		email: string;
		name: string;
		role: string;
		hasPassword: boolean;
	};
};

export abstract class LoginUseCasePort {
	abstract execute(command: LoginCommand): Promise<LoginResult>;
}
