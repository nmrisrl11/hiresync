import { EmployerJobListingResult } from "@/recruitment/application/ports/inbound/jobs";
import { EmployerJobListingResponseDto } from "../../dtos/jobs";

export class EmployerJobListingResponseMapper {
	public static toDto(result: EmployerJobListingResult): EmployerJobListingResponseDto {
		return {
			id: result.id,
			employerId: result.employerId,
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
			createdAt: result.createdAt,
			expiresAt: result.expiresAt,
		};
	}
}
