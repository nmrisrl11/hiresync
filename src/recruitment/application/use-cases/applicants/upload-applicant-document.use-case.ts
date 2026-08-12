import { ApplicantDocument } from "@/recruitment/domain/entities";
import { ApplicantProfileRepository } from "@/recruitment/domain/repositories";
import { DOCUMENT_TYPE } from "@/recruitment/domain/types";
import { ApplicantDocumentId } from "@/recruitment/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
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
		private readonly logger: LoggerPort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
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

		try {
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

			try {
				await this.domainEventPublisher.publishMultipleAsync(profile.domainEvents);
			} catch (publishError) {
				this.logger.error(
					`Failed to publish document upload events for ${profile.id.getValue()}`,
					(publishError as Error).stack,
				);
			} finally {
				profile.clearEvents();
			}
		} catch (error) {
			//! Compensate for failed profile update by deleting the orphaned file
			await this.documentStorage.deleteDocument(fileKey).catch((cleanupError) => {
				//! Record cleanup failure for async retry
				this.logger.error(
					`Failed to cleanup orphaned document ${fileKey}:`,
					cleanupError instanceof Error ? cleanupError.stack : "Unknown error",
				);
			});
			throw error; //! Rethrow original database/validation error
		}

		return { id: documentIdStr, fileKey: fileKey };
	}
}
