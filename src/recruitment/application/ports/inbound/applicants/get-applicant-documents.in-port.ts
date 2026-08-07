import { DocumentType } from "@/recruitment/domain/types";

export class GetApplicantDocumentsQuery {
	constructor(public readonly userId: string) {}
}

export type ApplicantDocumentResult = {
	id: string;
	type: DocumentType;
	originalFilename: string;
	fileKey: string;
	isPrimary: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export abstract class GetApplicantDocumentsUseCasePort {
	abstract execute(query: GetApplicantDocumentsQuery): Promise<ApplicantDocumentResult[]>;
}
