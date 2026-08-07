import { ApplicantProfileRepository } from "@/recruitment/domain/repositories";
import { Injectable } from "@nestjs/common";
import { ApplicantProfileNotFoundException } from "../../exceptions";
import {
	ApplicantDocumentResult,
	GetApplicantDocumentsQuery,
	GetApplicantDocumentsUseCasePort,
} from "../../ports/inbound/applicants";

@Injectable()
export class GetApplicantDocumentsUseCase implements GetApplicantDocumentsUseCasePort {
	constructor(private readonly applicantProfileRepository: ApplicantProfileRepository) {}

	public async execute(query: GetApplicantDocumentsQuery): Promise<ApplicantDocumentResult[]> {
		const profile = await this.applicantProfileRepository.findByUserId(query.userId);
		if (!profile) throw new ApplicantProfileNotFoundException();

		const documents = profile.getDocuments();

		return documents.map((doc) => ({
			id: doc.id.getValue(),
			type: doc.type,
			originalFilename: doc.originalFilename,
			fileKey: doc.fileKey,
			isPrimary: doc.isPrimary,
			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt,
		}));
	}
}
