export class ForgotPasswordCommand {
	constructor(public readonly email: string) {}
}

export type ForgotPasswordResult = {
	message: string;
};

export abstract class ForgotPasswordUseCasePort {
	abstract execute(command: ForgotPasswordCommand): Promise<ForgotPasswordResult>;
}
