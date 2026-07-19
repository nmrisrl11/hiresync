export class CreateEmployerProfileCommand {
	constructor(
		public readonly userId: string,
		public readonly companyName: string,
		public readonly description: string,
		public readonly website?: string,
		public readonly industry?: string,
	) {}
}

export abstract class CreateEmployerProfileUseCasePort {
	abstract execute(command: CreateEmployerProfileCommand): Promise<void>;
}
