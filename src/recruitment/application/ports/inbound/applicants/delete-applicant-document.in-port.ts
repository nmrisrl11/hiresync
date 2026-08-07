export class DeleteApplicantDocumentCommand {
	constructor(
		public readonly userId: string,
		public readonly documentId: string,
	) {}
}

export abstract class DeleteApplicantDocumentUseCasePort {
	abstract execute(command: DeleteApplicantDocumentCommand): Promise<void>;
}
