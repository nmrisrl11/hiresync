import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class PaginationDto {
	@ApiPropertyOptional({
		description: "The maximum number of items to return",
		minimum: 1,
		default: 10,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	public readonly limit: number = 10;

	@ApiPropertyOptional({
		description: "The number of items to skip before starting to collect the result set",
		minimum: 0,
		default: 0,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	public readonly offset: number = 0;
}
