import { ApplicantProfileRepository } from "@/recruitment/domain/repositories";
import { ApplicantDocumentId } from "@/recruitment/domain/value-objects";
import { Injectable } from "@nestjs/common";
import { ApplicantProfileNotFoundException } from "../../exceptions";
import {
	SetPrimaryApplicantDocumentCommand,
	SetPrimaryApplicantDocumentUseCasePort,
} from "../../ports/inbound/applicants";

@Injectable()
export class SetPrimaryApplicantDocumentUseCase implements SetPrimaryApplicantDocumentUseCasePort {
	constructor(private readonly applicantProfileRepository: ApplicantProfileRepository) {}

	public async execute(command: SetPrimaryApplicantDocumentCommand): Promise<void> {
		const profile = await this.applicantProfileRepository.findByUserId(command.userId);
		if (!profile) throw new ApplicantProfileNotFoundException();

		const documentIdVo = new ApplicantDocumentId(command.documentId);

		//! The aggregate root handles un-setting the previous primary and setting the new one
		profile.setPrimaryDocument(documentIdVo, command.type);

		await this.applicantProfileRepository.save(profile);
	}
}
