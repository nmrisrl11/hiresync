import { SavedJobToggledDomainEvent } from "@/recruitment/domain/events/applicants";
import {
	ApplicantProfileRepository,
	JobListingRepository,
	SavedJobRepository,
} from "@/recruitment/domain/repositories";
import { JobListingId } from "@/recruitment/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { ApplicantProfileNotFoundException, JobListingNotFoundException } from "../../exceptions";
import { ToggleSavedJobCommand, ToggleSavedJobUseCasePort } from "../../ports/inbound/applicants";

@Injectable()
export class ToggleSavedJobUseCase implements ToggleSavedJobUseCasePort {
	constructor(
		private readonly savedJobRepository: SavedJobRepository,
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly jobListingRepository: JobListingRepository,
		private readonly logger: LoggerPort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: ToggleSavedJobCommand): Promise<{ saved: boolean }> {
		const applicant = await this.applicantProfileRepository.findByUserId(command.userId);
		if (!applicant) throw new ApplicantProfileNotFoundException();

		const jobListing = await this.jobListingRepository.findById(
			new JobListingId(command.jobListingId),
		);
		if (!jobListing) throw new JobListingNotFoundException();

		const applicantId = applicant.id.getValue();
		const isSaved = await this.savedJobRepository.hasSavedJob(applicantId, command.jobListingId);

		let resultStatus: boolean;

		if (isSaved) {
			await this.savedJobRepository.removeSavedJob(applicantId, command.jobListingId);
			resultStatus = false;
		} else {
			await this.savedJobRepository.saveJob(applicantId, command.jobListingId);
			resultStatus = true;
		}

		try {
			await this.domainEventPublisher.publishAsync(
				new SavedJobToggledDomainEvent(applicantId, command.jobListingId, resultStatus),
			);
		} catch (error) {
			this.logger.error(
				`Failed to publish saved job toggled event for ${applicantId}`,
				(error as Error).stack,
			);
		}

		return { saved: resultStatus };
	}
}
