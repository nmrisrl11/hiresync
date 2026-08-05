import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CloseJobListingRequestDto {
	@ApiPropertyOptional({ example: "The position has been filled internally." })
	@IsString()
	@IsOptional()
	public readonly reason?: string;
}
