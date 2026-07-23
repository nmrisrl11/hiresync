export class EditApplicantProfileCommand {
	constructor(
		public readonly userId: string,
		public readonly firstName: string,
		public readonly lastName: string,
		public readonly headline?: string,
		public readonly bio?: string,
	) {}
}

export abstract class EditApplicantProfileUseCasePort {
	abstract execute(command: EditApplicantProfileCommand): Promise<void>;
}
