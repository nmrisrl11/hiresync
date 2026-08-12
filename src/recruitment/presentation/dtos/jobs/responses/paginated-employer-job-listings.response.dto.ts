import { PaginationMetaResponseDto } from "@/shared/http/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { EmployerJobListingResponseDto } from "./employer-job-listing.response.dto";

export class PaginatedEmployerJobListingsResponseDto {
	@ApiProperty({ type: [EmployerJobListingResponseDto] })
	public readonly data!: EmployerJobListingResponseDto[];

	@ApiProperty({ type: PaginationMetaResponseDto })
	public readonly meta!: PaginationMetaResponseDto;
}
