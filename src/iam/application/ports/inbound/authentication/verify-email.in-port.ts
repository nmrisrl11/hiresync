export class VerifyEmailCommand {
	constructor(public readonly token: string) {}
}

export type VerifyEmailResult = {
	message: string;
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		email: string;
		name: string;
		role: string;
	};
};

export abstract class VerifyEmailUseCasePort {
	abstract execute(command: VerifyEmailCommand): Promise<VerifyEmailResult>;
}
