import { DocumentType } from "@/recruitment/domain/types";

export class UploadApplicantDocumentCommand {
	constructor(
		public readonly userId: string,
		public readonly type: DocumentType,
		public readonly fileBuffer: Buffer,
		public readonly originalFilename: string,
	) {}
}

export type UploadApplicantDocumentResult = {
	id: string;
	fileKey: string;
};

export abstract class UploadApplicantDocumentUseCasePort {
	abstract execute(command: UploadApplicantDocumentCommand): Promise<UploadApplicantDocumentResult>;
}
