export class LoginUserCommand {
	constructor(
		public readonly email: string,
		public readonly password: string,
	) {}
}

export type LoginUserResult = {
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		email: string;
		name: string;
		role: string;
	};
};

export abstract class LoginUserUseCasePort {
	abstract execute(command: LoginUserCommand): Promise<LoginUserResult>;
}
