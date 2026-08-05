import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateApplicantProfileRequestDto {
	@ApiProperty({ description: "Applicant's first name" })
	@IsString()
	firstName!: string;

	@ApiProperty({ description: "Applicant's last name" })
	@IsString()
	lastName!: string;

	@ApiPropertyOptional({ description: "Professional headline (e.g., Senior Frontend Developer)" })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	headline?: string;

	@ApiPropertyOptional({ description: "Short biography or summary" })
	@IsOptional()
	@IsString()
	@MaxLength(2000)
	bio?: string;
}
