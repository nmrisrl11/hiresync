import {
	EMPLOYMENT_TYPE,
	type EmploymentType,
	LOCATION_TYPE,
	type LocationType,
} from "@/recruitment/domain/types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "./pagination.dto";

export class SearchJobListingDto extends PaginationDto {
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
}
