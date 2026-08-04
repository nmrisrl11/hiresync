import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl, MinLength } from "class-validator";

export class UpdateAccountRequestDto {
	@ApiPropertyOptional({ description: "The user's full name" })
	@IsOptional()
	@IsString()
	@MinLength(2, { message: "Name must be at least 2 characters long." })
	public readonly name?: string;

	@ApiPropertyOptional({ description: "URL to the user's avatar image" })
	@IsOptional()
	@IsUrl({}, { message: "Image must be a valid URL." })
	public readonly image?: string | null;
}
