import { JobApplication } from "@/recruitment/domain/entities";
import {
	ApplicantProfileRepository,
	JobApplicationRepository,
	JobListingRepository,
} from "@/recruitment/domain/repositories";
import { JOB_STATUS } from "@/recruitment/domain/types";
import { JobApplicationId, JobListingId } from "@/recruitment/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { IdGeneratorPort } from "@/shared/utils/ports";
import { Injectable } from "@nestjs/common";
import {
	ApplicantProfileNotFoundException,
	DuplicateJobApplicationException,
	JobListingNotFoundException,
	JobNotAcceptingApplicationsException,
} from "../../exceptions";
import { ApplyForJobCommand, ApplyForJobUseCasePort } from "../../ports/inbound/applications";
import { DocumentStoragePort } from "../../ports/outbound";

@Injectable()
export class ApplyForJobUseCase implements ApplyForJobUseCasePort {
	constructor(
		private readonly jobApplicationRepository: JobApplicationRepository,
		private readonly jobListingRepository: JobListingRepository,
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly idGenerator: IdGeneratorPort,
		private readonly documentStorage: DocumentStoragePort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: ApplyForJobCommand): Promise<string> {
		const jobListingIdVo = new JobListingId(command.jobListingId);

		//! Check if the applicant exists
		const applicant = await this.applicantProfileRepository.findByUserId(command.applicantId);
		if (!applicant) throw new ApplicantProfileNotFoundException();
		const applicantId = applicant.id;

		//! Check if the job listing exists and is published
		const jobListing = await this.jobListingRepository.findById(jobListingIdVo);
		if (!jobListing) throw new JobListingNotFoundException();
		if (jobListing.status !== JOB_STATUS.PUBLISHED)
			throw new JobNotAcceptingApplicationsException();

		//! Check if the applicant has already applied for this job
		const existingApplication = await this.jobApplicationRepository.findByApplicantAndJob(
			applicantId,
			jobListingIdVo,
		);
		if (existingApplication) throw new DuplicateJobApplicationException();

		const applicationId = new JobApplicationId(this.idGenerator.generateId());

		//! Upload resume (PDF)
		const resumeUrl = await this.documentStorage.uploadResume(
			command.resumeBuffer,
			`resume_${applicantId.getValue()}_${jobListingIdVo.getValue()}`,
		);

		//! Upload Cover Letter (TXT) if provided
		let coverLetterUrl: string | null = null;
		if (command.coverLetterBuffer) {
			coverLetterUrl = await this.documentStorage.uploadCoverLetter(
				command.coverLetterBuffer,
				`cover_letter_${applicantId.getValue()}_${jobListingIdVo.getValue()}.txt`,
			);
		}

		const application = JobApplication.submit(
			applicationId,
			applicantId,
			jobListingIdVo,
			jobListing.employerId,
			resumeUrl,
			coverLetterUrl,
		);

		await this.jobApplicationRepository.save(application);

		await this.domainEventPublisher.publishMultipleAsync(application.domainEvents);
		application.clearEvents();

		return applicationId.getValue();
	}
}
