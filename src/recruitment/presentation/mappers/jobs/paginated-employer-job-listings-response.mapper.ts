import { EmployerJobListingResult } from "@/recruitment/application/ports/inbound/jobs";
import { PaginatedEmployerJobListingsResponseDto } from "../../dtos/jobs";
import { EmployerJobListingResponseMapper } from "./employer-job-listing-response.mapper";

export class PaginatedEmployerJobListingsResponseMapper {
	public static toDto(
		result: { items: EmployerJobListingResult[]; total: number },
		limit: number,
		offset: number,
	): PaginatedEmployerJobListingsResponseDto {
		return {
			data: result.items.map((job) => EmployerJobListingResponseMapper.toDto(job)),
			meta: {
				totalRecords: result.total,
				count: result.items.length,
				limit,
				offset,
			},
		};
	}
}
