import { EmployerProfileRepository } from "@/recruitment/domain/repositories";
import { DomainEventPublisherPort } from "@/shared/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import { EmployerProfileNotFoundException } from "../../exceptions";
import {
	RemoveCompanyLogoCommand,
	RemoveCompanyLogoUseCasePort,
} from "../../ports/inbound/employers";
import { ImageStoragePort } from "../../ports/outbound";

@Injectable()
export class RemoveCompanyLogoUseCase implements RemoveCompanyLogoUseCasePort {
	constructor(
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly imageStorage: ImageStoragePort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: RemoveCompanyLogoCommand): Promise<void> {
		const employerProfile = await this.employerProfileRepository.findByUserId(command.userId);
		if (!employerProfile) throw new EmployerProfileNotFoundException();

		if (employerProfile.logoUrl) {
			await this.imageStorage.deleteImage(employerProfile.logoUrl).catch(() => {
				//! Silently fail if the old logo wasn't found in Cloudinary
			});

			employerProfile.updateLogo(null);

			await this.employerProfileRepository.save(employerProfile);

			await this.domainEventPublisher.publishMultipleAsync(employerProfile.domainEvents);
			employerProfile.clearEvents();
		}
	}
}
