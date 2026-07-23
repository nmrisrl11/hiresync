import { ApplicantProfileRepository } from "@/recruitment/domain/repositories";
import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
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
		private readonly eventDispatcher: DomainEventDispatcherPort,
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

		await this.eventDispatcher.dispatchMultiple(applicantProfile.domainEvents);
		applicantProfile.clearEvents();
	}
}
