import { JOB_STATUS, type JobStatus } from "@/recruitment/domain/types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Min } from "class-validator";

export class GetEmployerJobsDto {
	@ApiPropertyOptional({ example: 10, default: 10, minimum: 1 })
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@IsOptional()
	public readonly limit: number = 10;

	@ApiPropertyOptional({ example: 0, default: 0, minimum: 0 })
	@Type(() => Number)
	@IsInt()
	@Min(0)
	@IsOptional()
	public readonly offset: number = 0;

	@ApiPropertyOptional({ enum: JOB_STATUS, example: JOB_STATUS.PUBLISHED })
	@IsEnum(JOB_STATUS)
	@IsOptional()
	public readonly status?: JobStatus;
}
