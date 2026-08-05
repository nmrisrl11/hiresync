import { SavedJobResult } from "@/recruitment/application/ports/inbound/applicants";
import { PaginatedSavedJobsResponseDto } from "../../dtos/applicants";

export class PaginatedSavedJobsResponseMapper {
	public static toDto(
		result: { items: SavedJobResult[]; total: number },
		limit: number,
		offset: number,
	): PaginatedSavedJobsResponseDto {
		return {
			data: result.items.map((job) => ({
				id: job.id,
				employerId: job.employerId,
				title: job.title,
				locationType: job.locationType,
				locationAddress: job.locationAddress,
				employmentType: job.employmentType,
				salaryMin: job.salaryMin,
				salaryMax: job.salaryMax,
				salaryCurrency: job.salaryCurrency,
				status: job.status,
				createdAt: job.createdAt,
			})),
			meta: {
				totalRecords: result.total,
				count: result.items.length,
				limit,
				offset,
			},
		};
	}
}
