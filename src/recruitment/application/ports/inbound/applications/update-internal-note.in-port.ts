export class UpdateInternalNoteCommand {
	constructor(
		public readonly employerUserId: string,
		public readonly applicationId: string,
		public readonly note: string | null,
	) {}
}

export abstract class UpdateInternalNoteUseCasePort {
	abstract execute(command: UpdateInternalNoteCommand): Promise<void>;
}
