import { JOB_STATUS, type JobStatus } from "@/recruitment/domain/types";
import { PaginationDto } from "@/shared/http/dtos";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";

export class GetEmployerJobsDto extends PaginationDto {
	@ApiPropertyOptional({ enum: JOB_STATUS, example: JOB_STATUS.PUBLISHED })
	@IsEnum(JOB_STATUS)
	@IsOptional()
	public readonly status?: JobStatus;
}
