import { ApplicantProfileResult } from "@/recruitment/application/ports/inbound/applicants";
import { ApplicantProfileResponseDto } from "../../dtos/applicants";

export class ApplicantProfileResponseMapper {
	public static toDto(result: ApplicantProfileResult): ApplicantProfileResponseDto {
		return {
			id: result.id,
			userId: result.userId,
			firstName: result.firstName,
			lastName: result.lastName,
			headline: result.headline,
			bio: result.bio,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
		};
	}
}
