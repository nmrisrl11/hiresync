export class EnqueueEmployerWelcomeEmailCommand {
	constructor(
		public readonly employerId: string,
		public readonly companyName: string,
	) {}
}

export abstract class EnqueueEmployerWelcomeEmailUseCasePort {
	abstract execute(command: EnqueueEmployerWelcomeEmailCommand): Promise<void>;
}
