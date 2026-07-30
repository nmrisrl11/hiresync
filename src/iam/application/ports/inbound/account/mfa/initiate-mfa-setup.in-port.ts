export class InitiateMfaSetupCommand {
	constructor(public readonly userId: string) {}
}

export type InitiateMfaSetupResult = {
	secret: string;
	qrCodeUrl: string;
};

export abstract class InitiateMfaSetupUseCasePort {
	abstract execute(command: InitiateMfaSetupCommand): Promise<InitiateMfaSetupResult>;
}
