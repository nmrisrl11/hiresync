import { ApplicantProfileRepository } from "@/recruitment/domain/repositories";
import { Injectable } from "@nestjs/common";
import { ApplicantProfileNotFoundException } from "../../exceptions";
import {
	ApplicantProfileResult,
	GetApplicantProfileQuery,
	GetApplicantProfileUseCasePort,
} from "../../ports/inbound/applicants";

@Injectable()
export class GetApplicantProfileUseCase implements GetApplicantProfileUseCasePort {
	constructor(private readonly applicantProfileRepository: ApplicantProfileRepository) {}

	public async execute(query: GetApplicantProfileQuery): Promise<ApplicantProfileResult> {
		const applicantProfile = await this.applicantProfileRepository.findByUserId(query.userId);

		if (!applicantProfile) throw new ApplicantProfileNotFoundException();

		return {
			id: applicantProfile.id.getValue(),
			userId: applicantProfile.userId,
			firstName: applicantProfile.firstName,
			lastName: applicantProfile.lastName,
			headline: applicantProfile.headline,
			bio: applicantProfile.bio,
			createdAt: applicantProfile.createdAt,
			updatedAt: applicantProfile.updatedAt,
		};
	}
}
