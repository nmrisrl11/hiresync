import {
	ApplicantProfileRepository,
	EmployerProfileRepository,
	JobApplicationRepository,
} from "@/recruitment/domain/repositories";
import { JobApplicationId } from "@/recruitment/domain/value-objects";
import { Injectable } from "@nestjs/common";
import {
	ApplicantProfileNotFoundException,
	EmployerProfileNotFoundException,
	JobApplicationNotFoundException,
	UnauthorizedApplicationAccessException,
} from "../../exceptions";
import {
	ApplicationHistoryResult,
	GetApplicationHistoryQuery,
	GetApplicationHistoryUseCasePort,
} from "../../ports/inbound/applications";

@Injectable()
export class GetApplicationHistoryUseCase implements GetApplicationHistoryUseCasePort {
	constructor(
		private readonly jobApplicationRepository: JobApplicationRepository,
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly employerProfileRepository: EmployerProfileRepository,
	) {}

	public async execute(query: GetApplicationHistoryQuery): Promise<ApplicationHistoryResult[]> {
		const applicationIdVo = new JobApplicationId(query.applicationId);

		const application = await this.jobApplicationRepository.findById(applicationIdVo);
		if (!application) throw new JobApplicationNotFoundException();

		if (query.isEmployer) {
			const employer = await this.employerProfileRepository.findByUserId(query.userId);
			if (!employer) throw new EmployerProfileNotFoundException();

			if (!application.employerId.equals(employer.id)) {
				throw new UnauthorizedApplicationAccessException("Access denied to application history.");
			}
		} else {
			const applicant = await this.applicantProfileRepository.findByUserId(query.userId);
			if (!applicant) throw new ApplicantProfileNotFoundException();

			if (!application.applicantId.equals(applicant.id)) {
				throw new UnauthorizedApplicationAccessException("Access denied to application history.");
			}
		}

		//! Fetch the application history from the repository
		let history = await this.jobApplicationRepository.getHistory(applicationIdVo);

		//! Filter out private events if the requester is an applicant
		if (!query.isEmployer) {
			history = history.filter((event) => event.isPublic);
		}

		return history.map((event) => ({
			id: event.id.getValue(),
			eventType: event.eventType,
			message: event.message,
			metadata: event.metadata,
			isPublic: event.isPublic,
			createdAt: event.createdAt,
		}));
	}
}
