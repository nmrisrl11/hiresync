import { DocumentType } from "@/recruitment/domain/types";

export class SetPrimaryApplicantDocumentCommand {
	constructor(
		public readonly userId: string,
		public readonly documentId: string,
		public readonly type: DocumentType,
	) {}
}

export abstract class SetPrimaryApplicantDocumentUseCasePort {
	abstract execute(command: SetPrimaryApplicantDocumentCommand): Promise<void>;
}
