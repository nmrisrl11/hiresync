import { APPLICATION_STATUS, type ApplicationStatus } from "@/recruitment/domain/types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class GetApplicationsDto {
	@ApiPropertyOptional({ default: 10 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit: number = 10;

	@ApiPropertyOptional({ default: 0 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	offset: number = 0;

	@ApiPropertyOptional({ enum: APPLICATION_STATUS })
	@IsOptional()
	@IsEnum(APPLICATION_STATUS)
	status?: ApplicationStatus;

	@ApiPropertyOptional({ description: "Filter by specific job listing ID" })
	@IsOptional()
	@IsString()
	@IsUUID()
	jobListingId?: string;
}
