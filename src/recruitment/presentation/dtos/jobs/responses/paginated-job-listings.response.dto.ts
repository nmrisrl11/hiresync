import { ApiProperty } from "@nestjs/swagger";
import { PaginationMetaResponseDto } from "../../shared";
import { PublicJobListingResponseDto } from "./public-job-listing.response.dto";

export class PaginatedJobListingsResponseDto {
	@ApiProperty({ type: [PublicJobListingResponseDto] })
	public readonly data!: PublicJobListingResponseDto[];

	@ApiProperty({ type: PaginationMetaResponseDto })
	public readonly meta!: PaginationMetaResponseDto;
}
