import { ApiProperty } from "@nestjs/swagger";
import { PaginationMetaResponseDto } from "../../shared";
import { EmployerApplicationResponseDto } from "./employer-application.response.dto";

export class PaginatedEmployerApplicationsResponseDto {
	@ApiProperty({ type: [EmployerApplicationResponseDto] })
	public readonly data!: EmployerApplicationResponseDto[];

	@ApiProperty({ type: PaginationMetaResponseDto })
	public readonly meta!: PaginationMetaResponseDto;
}
