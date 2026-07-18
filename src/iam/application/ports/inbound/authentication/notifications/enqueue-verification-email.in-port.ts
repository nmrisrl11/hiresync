export class EnqueueVerificationEmailCommand {
	constructor(
		public readonly email: string,
		public readonly verificationToken: string,
		public readonly tokenExpiresInMs: number,
	) {}
}

export abstract class EnqueueVerificationEmailUseCasePort {
	abstract execute(command: EnqueueVerificationEmailCommand): Promise<void>;
}
