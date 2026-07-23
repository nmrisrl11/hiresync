import { JobApplication } from "@/recruitment/domain/entities";
import {
	ApplicantProfileRepository,
	JobApplicationRepository,
	JobListingRepository,
} from "@/recruitment/domain/repositories";
import { JOB_STATUS } from "@/recruitment/domain/types";
import { ApplicantId, JobApplicationId, JobListingId } from "@/recruitment/domain/value-objects";
import { DomainEventDispatcherPort, IdGeneratorPort } from "@/shared/application/ports/outbound";
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
		private readonly eventDispatcher: DomainEventDispatcherPort,
	) {}

	public async execute(command: ApplyForJobCommand): Promise<string> {
		const applicantIdVo = new ApplicantId(command.applicantId);
		const jobListingIdVo = new JobListingId(command.jobListingId);

		//! Check if the applicant exists
		const applicant = await this.applicantProfileRepository.findById(applicantIdVo);
		if (!applicant) throw new ApplicantProfileNotFoundException();

		//! Check if the job listing exists and is published
		const jobListing = await this.jobListingRepository.findById(jobListingIdVo);
		if (!jobListing) throw new JobListingNotFoundException();
		if (jobListing.status !== JOB_STATUS.PUBLISHED)
			throw new JobNotAcceptingApplicationsException();

		//! Check if the applicant has already applied for this job
		const existingApplication = await this.jobApplicationRepository.findByApplicantAndJob(
			applicantIdVo,
			jobListingIdVo,
		);
		if (existingApplication) throw new DuplicateJobApplicationException();

		const applicationId = new JobApplicationId(this.idGenerator.generateId());
		const application = JobApplication.submit(
			applicationId,
			applicantIdVo,
			jobListingIdVo,
			jobListing.employerId,
			command.resumeUrl,
			command.coverLetterUrl,
		);

		await this.jobApplicationRepository.save(application);

		await this.eventDispatcher.dispatchMultiple(applicant.domainEvents);
		application.clearEvents();

		return applicationId.getValue();
	}
}
