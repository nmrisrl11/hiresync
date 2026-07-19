import { Injectable } from "@nestjs/common";
import {
	CreateEmployerProfileCommand,
	CreateEmployerProfileUseCasePort,
} from "../../ports/inbound/employers";
import { EmployerProfileRepository } from "@/recruitment/domain/repositories";
import { EmployerProfileAlreadyExistsException } from "../../exceptions";
import { DomainEventDispatcherPort, IdGeneratorPort } from "@/shared/application/ports/outbound";
import { CompanyWebsite, EmployerId } from "@/recruitment/domain/value-objects";
import { EmployerProfile } from "@/recruitment/domain/entities";

@Injectable()
export class CreateEmployerProfileUseCase implements CreateEmployerProfileUseCasePort {
	constructor(
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly idGenerator: IdGeneratorPort,
		private readonly eventDispatcher: DomainEventDispatcherPort,
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

		await this.eventDispatcher.dispatchMultiple(profile.domainEvents);
		profile.clearEvents();
	}
}
