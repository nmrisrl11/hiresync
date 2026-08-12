import { ApplicantProfileRepository } from "@/recruitment/domain/repositories";
import { ApplicantDocumentId } from "@/recruitment/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { ApplicantProfileNotFoundException } from "../../exceptions";
import {
	SetPrimaryApplicantDocumentCommand,
	SetPrimaryApplicantDocumentUseCasePort,
} from "../../ports/inbound/applicants";

@Injectable()
export class SetPrimaryApplicantDocumentUseCase implements SetPrimaryApplicantDocumentUseCasePort {
	constructor(
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly logger: LoggerPort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: SetPrimaryApplicantDocumentCommand): Promise<void> {
		const profile = await this.applicantProfileRepository.findByUserId(command.userId);
		if (!profile) throw new ApplicantProfileNotFoundException();

		const documentIdVo = new ApplicantDocumentId(command.documentId);

		//! The aggregate root handles un-setting the previous primary and setting the new one
		profile.setPrimaryDocument(documentIdVo, command.type);

		await this.applicantProfileRepository.save(profile);

		try {
			await this.domainEventPublisher.publishMultipleAsync(profile.domainEvents);
		} catch (error) {
			this.logger.error(
				`Failed to publish primary document event for ${profile.id.getValue()}`,
				(error as Error).stack,
			);
		} finally {
			profile.clearEvents();
		}
	}
}
