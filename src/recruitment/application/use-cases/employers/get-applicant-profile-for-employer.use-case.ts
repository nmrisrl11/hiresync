import {
	ApplicantProfileRepository,
	EmployerProfileRepository,
	JobApplicationRepository,
} from "@/recruitment/domain/repositories";
import { ApplicantId } from "@/recruitment/domain/value-objects";
import { Injectable } from "@nestjs/common";
import {
	ApplicantProfileNotFoundException,
	EmployerProfileNotFoundException,
	UnauthorizedApplicantAccessException,
} from "../../exceptions";
import {
	ApplicantProfileResult,
	GetApplicantProfileForEmployerQuery,
	GetApplicantProfileForEmployerUseCasePort,
} from "../../ports/inbound/employers";

@Injectable()
export class GetApplicantProfileForEmployerUseCase implements GetApplicantProfileForEmployerUseCasePort {
	constructor(
		private readonly employerProfileRepository: EmployerProfileRepository,
		private readonly applicantProfileRepository: ApplicantProfileRepository,
		private readonly jobApplicationRepository: JobApplicationRepository,
	) {}

	public async execute(
		query: GetApplicantProfileForEmployerQuery,
	): Promise<ApplicantProfileResult> {
		const employer = await this.employerProfileRepository.findByUserId(query.employerUserId);
		if (!employer) throw new EmployerProfileNotFoundException();

		const applicantIdVo = new ApplicantId(query.applicantId);
		const applicant = await this.applicantProfileRepository.findById(applicantIdVo);
		if (!applicant) throw new ApplicantProfileNotFoundException();

		const filter = {
			employerId: employer.id.getValue(),
			applicantId: applicant.id.getValue(),
			limit: 1,
			offset: 0,
		};

		const applicationCount = await this.jobApplicationRepository.count(filter);
		if (applicationCount === 0) throw new UnauthorizedApplicantAccessException();

		return {
			id: applicant.id.getValue(),
			firstName: applicant.firstName,
			lastName: applicant.lastName,
			headline: applicant.headline,
			bio: applicant.bio,
			userId: applicant.userId,
		};
	}
}
