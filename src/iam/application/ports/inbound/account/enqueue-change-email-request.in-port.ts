export class EnqueueChangeEmailRequestCommand {
	constructor(
		public readonly email: string,
		public readonly changeToken: string,
		public readonly tokenExpiresInMs: number,
	) {}
}

export abstract class EnqueueChangeEmailRequestUseCasePort {
	abstract execute(command: EnqueueChangeEmailRequestCommand): Promise<void>;
}
