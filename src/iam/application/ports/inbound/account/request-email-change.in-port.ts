export class RequestEmailChangeCommand {
	constructor(
		public readonly userId: string,
		public readonly newEmail: string,
	) {}
}

export abstract class RequestEmailChangeUseCasePort {
	abstract execute(command: RequestEmailChangeCommand): Promise<void>;
}
