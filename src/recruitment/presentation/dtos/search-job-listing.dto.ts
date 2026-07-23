import {
	EMPLOYMENT_TYPE,
	type EmploymentType,
	LOCATION_TYPE,
	type LocationType,
} from "@/recruitment/domain/types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export class SearchJobListingDto {
	@ApiPropertyOptional({ description: "Search by job title or description" })
	@IsOptional()
	@IsString()
	searchQuery?: string;

	@ApiPropertyOptional({ enum: EMPLOYMENT_TYPE })
	@IsOptional()
	@IsEnum(EMPLOYMENT_TYPE)
	employmentType?: EmploymentType;

	@ApiPropertyOptional({ enum: LOCATION_TYPE })
	@IsOptional()
	@IsEnum(LOCATION_TYPE)
	locationType?: LocationType;

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
}
