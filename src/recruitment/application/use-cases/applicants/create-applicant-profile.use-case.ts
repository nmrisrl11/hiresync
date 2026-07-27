import { ApplicantProfile } from "@/recruitment/domain/entities";
import { ApplicantProfileRepository } from "@/recruitment/domain/repositories";
import { ApplicantId } from "@/recruitment/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { IdGeneratorPort } from "@/shared/utils/ports";
import { Injectable } from "@nestjs/common";
import { ApplicantProfileAlreadyExistsException } from "../../exceptions";
import {
	CreateApplicantProfileCommand,
	CreateApplicantProfileUseCasePort,
} from "../../ports/inbound/applicants";

@Injectable()
export class CreateApplicantProfileUseCase implements CreateApplicantProfileUseCasePort {
	constructor(
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly idGenerator: IdGeneratorPort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: CreateApplicantProfileCommand): Promise<void> {
		const existingProfile = await this.applicantProfileRepository.findByUserId(command.userId);

		if (existingProfile) throw new ApplicantProfileAlreadyExistsException();

		const applicantId = new ApplicantId(this.idGenerator.generateId());

		const applicantProfile = ApplicantProfile.create(
			applicantId,
			command.userId,
			command.firstName,
			command.lastName,
			command.headline || null,
			command.bio || null,
		);

		await this.applicantProfileRepository.save(applicantProfile);

		await this.domainEventPublisher.publishMultipleAsync(applicantProfile.domainEvents);
		applicantProfile.clearEvents();
	}
}
