export class UpdateAccountCommand {
	constructor(
		public readonly userId: string,
		public readonly name?: string,
		public readonly image?: string | null,
	) {}
}

export abstract class UpdateAccountUseCasePort {
	abstract execute(command: UpdateAccountCommand): Promise<void>;
}
