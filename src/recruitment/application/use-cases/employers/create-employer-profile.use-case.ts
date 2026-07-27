import { EmployerProfile } from "@/recruitment/domain/entities";
import { EmployerProfileRepository } from "@/recruitment/domain/repositories";
import { CompanyWebsite, EmployerId } from "@/recruitment/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { IdGeneratorPort } from "@/shared/utils/ports";
import { Injectable } from "@nestjs/common";
import { EmployerProfileAlreadyExistsException } from "../../exceptions";
import {
	CreateEmployerProfileCommand,
	CreateEmployerProfileUseCasePort,
} from "../../ports/inbound/employers";

@Injectable()
export class CreateEmployerProfileUseCase implements CreateEmployerProfileUseCasePort {
	constructor(
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly idGenerator: IdGeneratorPort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: CreateEmployerProfileCommand): Promise<void> {
		const existingProfile = await this.employerProfileRepository.findByUserId(command.userId);

		if (existingProfile)
			throw new EmployerProfileAlreadyExistsException("User already has an employer profile.");

		const employerId = new EmployerId(this.idGenerator.generateId());
		const websiteVo = command.website ? new CompanyWebsite(command.website) : null;

		const profile = EmployerProfile.create(
			employerId,
			command.userId,
			command.companyName,
			command.description,
			websiteVo,
			null,
			command.industry ?? null,
		);

		await this.employerProfileRepository.save(profile);

		await this.domainEventPublisher.publishMultipleAsync(profile.domainEvents);
		profile.clearEvents();
	}
}
