import { PublicJobListingResult } from "@/recruitment/application/ports/inbound/jobs";
import { PublicJobListingResponseDto } from "../../dtos/jobs";

export class PublicJobListingResponseMapper {
	public static toDto(result: PublicJobListingResult): PublicJobListingResponseDto {
		return {
			id: result.id,
			employerId: result.employerId,
			companyName: result.companyName,
			companyLogoUrl: result.companyLogoUrl,
			title: result.title,
			description: result.description,
			requirements: result.requirements,
			employmentType: result.employmentType,
			locationType: result.locationType,
			locationAddress: result.locationAddress,
			salaryMin: result.salaryMin,
			salaryMax: result.salaryMax,
			salaryCurrency: result.salaryCurrency,
			status: result.status,
			postedAt: result.postedAt,
		};
	}
}
