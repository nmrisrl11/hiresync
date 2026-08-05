import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateEmployerProfileRequestDto {
	@ApiProperty({ example: "TechNova Solutions" })
	@IsString()
	@IsNotEmpty()
	public readonly companyName!: string;

	@ApiProperty({ example: "A leading provider of innovative software solutions." })
	@IsString()
	@IsNotEmpty()
	public readonly description!: string;

	@ApiPropertyOptional({ example: "https://technova.example.com" })
	@IsUrl()
	@IsOptional()
	public readonly website?: string;

	@ApiPropertyOptional({ example: "Information Technology" })
	@IsString()
	@IsOptional()
	public readonly industry?: string;
}
