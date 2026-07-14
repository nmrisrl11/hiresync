export class ConfirmEmailChangeCommand {
	constructor(public readonly token: string) {}
}

export abstract class ConfirmEmailChangeUseCasePort {
	abstract execute(command: ConfirmEmailChangeCommand): Promise<void>;
}
