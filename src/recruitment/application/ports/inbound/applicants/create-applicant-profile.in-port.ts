export class CreateApplicantProfileCommand {
	constructor(
		public readonly userId: string,
		public readonly firstName: string,
		public readonly lastName: string,
		public readonly headline?: string,
		public readonly bio?: string,
	) {}
}

export abstract class CreateApplicantProfileUseCasePort {
	abstract execute(command: CreateApplicantProfileCommand): Promise<void>;
}
