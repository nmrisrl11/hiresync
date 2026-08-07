import { ApplicantProfileRepository } from "@/recruitment/domain/repositories";
import { ApplicantDocumentId } from "@/recruitment/domain/value-objects";
import { Injectable } from "@nestjs/common";
import { ApplicantProfileNotFoundException } from "../../exceptions";
import {
	DeleteApplicantDocumentCommand,
	DeleteApplicantDocumentUseCasePort,
} from "../../ports/inbound/applicants";
import { DocumentStoragePort } from "../../ports/outbound";

@Injectable()
export class DeleteApplicantDocumentUseCase implements DeleteApplicantDocumentUseCasePort {
	constructor(
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly documentStorage: DocumentStoragePort,
	) {}

	public async execute(command: DeleteApplicantDocumentCommand): Promise<void> {
		const profile = await this.applicantProfileRepository.findByUserId(command.userId);
		if (!profile) throw new ApplicantProfileNotFoundException();

		const documentIdVo = new ApplicantDocumentId(command.documentId);

		//! The aggregate root enforces the domain rules and throws DocumentNotFoundException if invalid
		const removedDocument = profile.removeDocument(documentIdVo);

		//! Delete the actual file from Cloudinary using the stored fileKey
		await this.documentStorage.deleteDocument(removedDocument.fileKey).catch(() => {
			//! Silently fail if the document is already missing from the cloud provider
		});

		//! Persist the updated aggregate root (which will delete the document row via cascade/orphan removal)
		await this.applicantProfileRepository.save(profile);
	}
}
