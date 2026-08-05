import { ApplicantJobApplicationResult } from "@/recruitment/application/ports/inbound/applications";
import { PaginatedApplicantApplicationsResponseDto } from "../../dtos/applications";

export class PaginatedApplicantApplicationsResponseMapper {
	public static toDto(
		result: { items: ApplicantJobApplicationResult[]; total: number },
		limit: number,
		offset: number,
	): PaginatedApplicantApplicationsResponseDto {
		return {
			data: result.items.map((app) => ({
				id: app.id,
				jobListingId: app.jobListingId,
				employerId: app.employerId,
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
