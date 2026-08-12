import { PaginationMetaResponseDto } from "@/shared/http/dtos";
import { ApiProperty } from "@nestjs/swagger";
import { ApplicantApplicationResponseDto } from "./applicant-application.response.dto";

export class PaginatedApplicantApplicationsResponseDto {
	@ApiProperty({ type: [ApplicantApplicationResponseDto] })
	public readonly data!: ApplicantApplicationResponseDto[];

	@ApiProperty({ type: PaginationMetaResponseDto })
	public readonly meta!: PaginationMetaResponseDto;
}
