export class EnqueuePasswordResetEmailCommand {
	constructor(
		public readonly email: string,
		public readonly resetToken: string,
		public readonly tokenExpiresInMs: number,
	) {}
}

export abstract class EnqueuePasswordResetEmailUseCasePort {
	abstract execute(command: EnqueuePasswordResetEmailCommand): Promise<void>;
}
