import { PaginationMetaResponseDto } from "@/shared/http/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { SavedJobResponseDto } from "./saved-job.response.dto";

export class PaginatedSavedJobsResponseDto {
	@ApiProperty({ type: [SavedJobResponseDto] })
	public readonly data!: SavedJobResponseDto[];

	@ApiProperty({ type: PaginationMetaResponseDto })
	public readonly meta!: PaginationMetaResponseDto;
}
