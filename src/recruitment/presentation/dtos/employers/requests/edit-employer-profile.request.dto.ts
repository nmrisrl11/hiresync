import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator";

export class EditEmployerProfileRequestDto {
	@ApiProperty({ example: "Tech Corp Inc." })
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	companyName!: string;

	@ApiProperty({ example: "We build awesome software." })
	@IsString()
	@MinLength(10)
	@MaxLength(2000)
	description!: string;

	@ApiPropertyOptional({ example: "https://techcorp.com" })
	@IsOptional()
	@IsUrl()
	website?: string;

	@ApiPropertyOptional({ example: "Software Development" })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	industry?: string;
}
