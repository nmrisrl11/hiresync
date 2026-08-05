import { ApiProperty } from "@nestjs/swagger";
import { PaginationMetaResponseDto } from "../../shared";
import { ApplicantApplicationResponseDto } from "./applicant-application.response.dto";

export class PaginatedApplicantApplicationsResponseDto {
	@ApiProperty({ type: [ApplicantApplicationResponseDto] })
	public readonly data!: ApplicantApplicationResponseDto[];

	@ApiProperty({ type: PaginationMetaResponseDto })
	public readonly meta!: PaginationMetaResponseDto;
}
