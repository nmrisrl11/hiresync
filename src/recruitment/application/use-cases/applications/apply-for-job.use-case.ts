import { JobApplication } from "@/recruitment/domain/entities";
import { DocumentNotFoundException } from "@/recruitment/domain/exceptions";
import {
	ApplicantProfileRepository,
	JobApplicationRepository,
	JobListingRepository,
} from "@/recruitment/domain/repositories";
import { DOCUMENT_TYPE, JOB_STATUS } from "@/recruitment/domain/types";
import {
	ApplicantDocumentId,
	JobApplicationId,
	JobListingId,
} from "@/recruitment/domain/value-objects";
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

@Injectable()
export class ApplyForJobUseCase implements ApplyForJobUseCasePort {
	constructor(
		private readonly jobApplicationRepository: JobApplicationRepository,
		private readonly jobListingRepository: JobListingRepository,
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly idGenerator: IdGeneratorPort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: ApplyForJobCommand): Promise<string> {
		const jobListingIdVo = new JobListingId(command.jobListingId);

		//! Check if the applicant exists
		const applicant = await this.applicantProfileRepository.findByUserId(command.applicantUserId);
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

		const resumeIdVo = new ApplicantDocumentId(command.resumeDocumentId);
		const selectedResume = applicant.getDocuments().find((d) => d.id.equals(resumeIdVo));

		if (!selectedResume || selectedResume.type !== DOCUMENT_TYPE.RESUME)
			throw new DocumentNotFoundException("Invalid or missing resume document selected.");

		let coverLetterKey: string | null = null;
		if (command.coverLetterDocumentId) {
			const coverLetterIdVo = new ApplicantDocumentId(command.coverLetterDocumentId);
			const selectedCoverLetter = applicant
				.getDocuments()
				.find((d) => d.id.equals(coverLetterIdVo));

			if (!selectedCoverLetter || selectedCoverLetter.type !== DOCUMENT_TYPE.COVER_LETTER) {
				throw new DocumentNotFoundException("Invalid cover letter document selected.");
			}
			coverLetterKey = selectedCoverLetter.fileKey;
		}

		const applicationId = new JobApplicationId(this.idGenerator.generateId());

		const application = JobApplication.submit(
			applicationId,
			applicantId,
			jobListingIdVo,
			jobListing.employerId,
			selectedResume.fileKey,
			coverLetterKey,
		);

		await this.jobApplicationRepository.save(application);

		await this.domainEventPublisher.publishMultipleAsync(application.domainEvents);
		application.clearEvents();

		return applicationId.getValue();
	}
}
