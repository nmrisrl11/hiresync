import { EmployerProfileRepository } from "@/recruitment/domain/repositories";
import { CompanyWebsite } from "@/recruitment/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { Injectable } from "@nestjs/common";
import { EmployerProfileNotFoundException } from "../../exceptions";
import {
	EditEmployerProfileCommand,
	EditEmployerProfileUseCasePort,
} from "../../ports/inbound/employers";

@Injectable()
export class EditEmployerProfileUseCase implements EditEmployerProfileUseCasePort {
	constructor(
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: EditEmployerProfileCommand): Promise<void> {
		const employerProfile = await this.employerProfileRepository.findByUserId(command.userId);
		if (!employerProfile) throw new EmployerProfileNotFoundException();

		const websiteVo = command.website ? new CompanyWebsite(command.website) : null;

		employerProfile.updateProfile(
			command.companyName,
			command.description,
			websiteVo,
			command.industry,
		);

		await this.employerProfileRepository.save(employerProfile);

		await this.domainEventPublisher.publishMultipleAsync(employerProfile.domainEvents);
		employerProfile.clearEvents();
	}
}
