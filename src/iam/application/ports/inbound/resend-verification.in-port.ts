export class ResendVerificationCommand {
	constructor(public readonly email: string) {}
}

export type ResendVerificationResult = {
	message: string;
};

export abstract class ResendVerificationUseCasePort {
	abstract execute(command: ResendVerificationCommand): Promise<ResendVerificationResult>;
}
