import {
	ApplicantProfileRepository,
	JobListingRepository,
	SavedJobRepository,
} from "@/recruitment/domain/repositories";
import { JobListingId } from "@/recruitment/domain/value-objects";
import { Injectable } from "@nestjs/common";
import { ApplicantProfileNotFoundException, JobListingNotFoundException } from "../../exceptions";
import { ToggleSavedJobCommand, ToggleSavedJobUseCasePort } from "../../ports/inbound/applicants";

@Injectable()
export class ToggleSavedJobUseCase implements ToggleSavedJobUseCasePort {
	constructor(
		private readonly savedJobRepository: SavedJobRepository,
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly jobListingRepository: JobListingRepository,
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

		if (isSaved) {
			await this.savedJobRepository.removeSavedJob(applicantId, command.jobListingId);
			return { saved: false };
		} else {
			await this.savedJobRepository.saveJob(applicantId, command.jobListingId);
			return { saved: true };
		}
	}
}
