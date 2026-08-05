import { EmployerJobApplicationResult } from "@/recruitment/application/ports/inbound/applications";
import { PaginatedEmployerApplicationsResponseDto } from "../../dtos/applications";

export class PaginatedEmployerApplicationsResponseMapper {
	public static toDto(
		result: { items: EmployerJobApplicationResult[]; total: number },
		limit: number,
		offset: number,
	): PaginatedEmployerApplicationsResponseDto {
		return {
			data: result.items.map((app) => ({
				id: app.id,
				jobListingId: app.jobListingId,
				applicantId: app.applicantId,
				status: app.status,
				resumeUrl: app.resumeUrl,
				coverLetterUrl: app.coverLetterUrl,
				appliedAt: app.appliedAt,
				updatedAt: app.updatedAt,
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
