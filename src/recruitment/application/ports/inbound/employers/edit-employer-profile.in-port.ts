export class EditEmployerProfileCommand {
	constructor(
		public readonly userId: string,
		public readonly companyName: string,
		public readonly description: string,
		public readonly website: string | null,
		public readonly industry: string | null,
	) {}
}

export abstract class EditEmployerProfileUseCasePort {
	abstract execute(command: EditEmployerProfileCommand): Promise<void>;
}
