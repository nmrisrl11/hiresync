import { PublicJobListingResult } from "@/recruitment/application/ports/inbound/jobs";
import { PaginatedJobListingsResponseDto } from "../../dtos/jobs";
import { PublicJobListingResponseMapper } from "./public-job-listing-response.mapper";

export class PaginatedJobListingsResponseMapper {
	public static toDto(
		result: { items: PublicJobListingResult[]; total: number },
		limit: number,
		offset: number,
	): PaginatedJobListingsResponseDto {
		return {
			data: result.items.map((job) => PublicJobListingResponseMapper.toDto(job)),
			meta: {
				totalRecords: result.total,
				count: result.items.length,
				limit,
				offset,
			},
		};
	}
}
