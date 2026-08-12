import { EmployerProfileRepository } from "@/recruitment/domain/repositories";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { EmployerProfileNotFoundException } from "../../exceptions";
import {
	UploadCompanyLogoCommand,
	UploadCompanyLogoUseCasePort,
} from "../../ports/inbound/employers";
import { ImageStoragePort } from "../../ports/outbound";

@Injectable()
export class UploadCompanyLogoUseCase implements UploadCompanyLogoUseCasePort {
	constructor(
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly imageStorage: ImageStoragePort,
		private readonly logger: LoggerPort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: UploadCompanyLogoCommand): Promise<void> {
		const employerProfile = await this.employerProfileRepository.findByUserId(command.userId);
		if (!employerProfile) throw new EmployerProfileNotFoundException();

		if (employerProfile.logoUrl) {
			await this.imageStorage.deleteImage(employerProfile.logoUrl).catch(() => {
				//! Silently fail if the old logo wasn't found in Cloudinary
			});
		}

		const publicId = await this.imageStorage.uploadLogo(
			command.fileBuffer,
			`employer_${employerProfile.id.getValue()}`,
		);

		employerProfile.updateLogo(publicId);

		await this.employerProfileRepository.save(employerProfile);

		try {
			await this.domainEventPublisher.publishMultipleAsync(employerProfile.domainEvents);
		} catch (error) {
			this.logger.error(
				`Failed to publish company logo event for ${employerProfile.id.getValue()}`,
				(error as Error).stack,
			);
		} finally {
			employerProfile.clearEvents();
		}
	}
}
