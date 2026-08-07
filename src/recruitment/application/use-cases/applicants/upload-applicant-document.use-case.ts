import { ApplicantDocument } from "@/recruitment/domain/entities";
import { ApplicantProfileRepository } from "@/recruitment/domain/repositories";
import { DOCUMENT_TYPE } from "@/recruitment/domain/types";
import { ApplicantDocumentId } from "@/recruitment/domain/value-objects";
import { IdGeneratorPort } from "@/shared/utils/ports";
import { Injectable } from "@nestjs/common";
import { ApplicantProfileNotFoundException } from "../../exceptions";
import {
	UploadApplicantDocumentCommand,
	UploadApplicantDocumentResult,
	UploadApplicantDocumentUseCasePort,
} from "../../ports/inbound/applicants";
import { DocumentStoragePort } from "../../ports/outbound";

@Injectable()
export class UploadApplicantDocumentUseCase implements UploadApplicantDocumentUseCasePort {
	constructor(
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly documentStorage: DocumentStoragePort,
		private readonly idGenerator: IdGeneratorPort,
	) {}

	public async execute(
		command: UploadApplicantDocumentCommand,
	): Promise<UploadApplicantDocumentResult> {
		const profile = await this.applicantProfileRepository.findByUserId(command.userId);
		if (!profile) throw new ApplicantProfileNotFoundException();

		const documentIdStr = this.idGenerator.generateId();
		const documentIdVo = new ApplicantDocumentId(documentIdStr);
		const fileName = `${command.type.toLowerCase()}_${profile.id.getValue()}_${documentIdStr}`;

		let fileKey: string;

		if (command.type === DOCUMENT_TYPE.RESUME) {
			fileKey = await this.documentStorage.uploadResume(command.fileBuffer, fileName);
		} else {
			fileKey = await this.documentStorage.uploadCoverLetter(command.fileBuffer, fileName);
		}

		const document = new ApplicantDocument(
			documentIdVo,
			profile.id,
			command.type,
			command.originalFilename,
			fileKey,
			false, //! Aggregate root will handle primary assignment logic
			new Date(),
			new Date(),
		);

		profile.addDocument(document);

		await this.applicantProfileRepository.save(profile);

		return { id: documentIdStr, fileKey: fileKey };
	}
}
