import { ApplicantProfileResult } from "@/recruitment/application/ports/inbound/employers";
import { EmployerApplicantProfileResponseDto } from "../../dtos/employers";

export class EmployerApplicantProfileResponseMapper {
	public static toDto(result: ApplicantProfileResult): EmployerApplicantProfileResponseDto {
		return {
			id: result.id,
			userId: result.userId,
			firstName: result.firstName,
			lastName: result.lastName,
			headline: result.headline,
			bio: result.bio,
		};
	}
}
