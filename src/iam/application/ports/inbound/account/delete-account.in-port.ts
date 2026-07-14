export class DeleteAccountCommand {
	constructor(public readonly userId: string) {}
}

export abstract class DeleteAccountUseCasePort {
	abstract execute(command: DeleteAccountCommand): Promise<void>;
}
