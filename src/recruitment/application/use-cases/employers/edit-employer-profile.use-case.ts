import { Injectable } from "@nestjs/common";
import {
	EditEmployerProfileCommand,
	EditEmployerProfileUseCasePort,
} from "../../ports/inbound/employers";
import { EmployerProfileRepository } from "@/recruitment/domain/repositories";
import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
import { EmployerProfileNotFoundException } from "../../exceptions";
import { CompanyWebsite } from "@/recruitment/domain/value-objects";

@Injectable()
export class EditEmployerProfileUseCase implements EditEmployerProfileUseCasePort {
	constructor(
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly eventDispatcher: DomainEventDispatcherPort,
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

		await this.eventDispatcher.dispatchMultiple(employerProfile.domainEvents);
		employerProfile.clearEvents();
	}
}
