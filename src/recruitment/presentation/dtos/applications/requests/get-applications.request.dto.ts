import { APPLICATION_STATUS, type ApplicationStatus } from "@/recruitment/domain/types";
import { PaginationDto } from "@/shared/http/dtos";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export class GetApplicationsRequestDto extends PaginationDto {
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
