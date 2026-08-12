import { PaginationMetaResponseDto } from "@/shared/http/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { PublicJobListingResponseDto } from "./public-job-listing.response.dto";

export class PaginatedJobListingsResponseDto {
	@ApiProperty({ type: [PublicJobListingResponseDto] })
	public readonly data!: PublicJobListingResponseDto[];

	@ApiProperty({ type: PaginationMetaResponseDto })
	public readonly meta!: PaginationMetaResponseDto;
}
