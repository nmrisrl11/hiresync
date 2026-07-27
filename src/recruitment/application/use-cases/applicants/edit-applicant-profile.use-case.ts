import { ApplicantProfileRepository } from "@/recruitment/domain/repositories";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { Injectable } from "@nestjs/common";
import { ApplicantProfileNotFoundException } from "../../exceptions";
import {
	EditApplicantProfileCommand,
	EditApplicantProfileUseCasePort,
} from "../../ports/inbound/applicants";

@Injectable()
export class EditApplicantProfileUseCase implements EditApplicantProfileUseCasePort {
	constructor(
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: EditApplicantProfileCommand): Promise<void> {
		const applicantProfile = await this.applicantProfileRepository.findByUserId(command.userId);

		if (!applicantProfile) throw new ApplicantProfileNotFoundException();

		applicantProfile.updateProfile(
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
