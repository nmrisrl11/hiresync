export class RegisterUserCommand {
	constructor(
		public readonly email: string,
		public readonly name: string,
		public readonly password: string,
		public readonly roleCode: string,
	) {}
}

export type RegisterUserResult = {
	verificationEmailEnqueued: boolean;
};

export abstract class RegisterUserUseCasePort {
	abstract execute(command: RegisterUserCommand): Promise<RegisterUserResult>;
}
