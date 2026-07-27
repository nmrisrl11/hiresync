import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CloseJobListingDto {
	@ApiPropertyOptional({ example: "The position has been filled internally." })
	@IsString()
	@IsOptional()
	public readonly reason?: string;
}
