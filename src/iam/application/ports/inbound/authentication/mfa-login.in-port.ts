export class MfaLoginCommand {
	constructor(
		public readonly mfaChallengeToken: string,
		public readonly code: string, //! Accepts either a 6-digit TOTP OR a backup recovery code
		public readonly userAgent: string | null = null,
		public readonly ipAddress: string | null = null,
	) {}
}

export type MfaLoginResult = {
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		email: string;
		name: string;
		role: string;
	};
};

export abstract class MfaLoginUseCasePort {
	abstract execute(command: MfaLoginCommand): Promise<MfaLoginResult>;
}
