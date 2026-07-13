export class ResetPasswordCommand {
	constructor(
		public readonly token: string,
		public readonly password: string,
	) {}
}

export type ResetPasswordResult = {
	message: string;
};

export abstract class ResetPasswordUseCasePort {
	abstract execute(command: ResetPasswordCommand): Promise<ResetPasswordResult>;
}
