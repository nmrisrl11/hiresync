import {
	EMPLOYMENT_TYPE,
	LOCATION_TYPE,
	type EmploymentType,
	type LocationType,
} from "@/recruitment/domain/types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsArray,
	IsDate,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
} from "class-validator";

export class CreateJobListingDto {
	@ApiProperty({ example: "Senior Frontend Developer" })
	@IsString()
	@IsNotEmpty()
	public readonly title!: string;

	@ApiProperty({ example: "We are looking for an experienced developer..." })
	@IsString()
	@IsNotEmpty()
	public readonly description!: string;

	@ApiProperty({
		example: ["5+ years React experience", "Strong TypeScript skills"],
		type: [String],
	})
	@IsArray()
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	public readonly requirements!: string[];

	@ApiProperty({ enum: EMPLOYMENT_TYPE, example: EMPLOYMENT_TYPE.FULL_TIME })
	@IsEnum(EMPLOYMENT_TYPE)
	public readonly employmentType!: EmploymentType;

	@ApiProperty({ enum: LOCATION_TYPE, example: LOCATION_TYPE.REMOTE })
	@IsEnum(LOCATION_TYPE)
	public readonly locationType!: LocationType;

	@ApiPropertyOptional({ example: "123 Tech Boulevard, San Francisco, CA" })
	@IsString()
	@IsOptional()
	public readonly locationAddress?: string;

	@ApiPropertyOptional({ example: 120000 })
	@IsNumber()
	@Min(0)
	@IsOptional()
	public readonly salaryMin?: number;

	@ApiPropertyOptional({ example: 160000 })
	@IsNumber()
	@Min(0)
	@IsOptional()
	public readonly salaryMax?: number;

	@ApiProperty({ example: "USD", default: "USD" })
	@IsString()
	@IsNotEmpty()
	public readonly salaryCurrency: string = "USD";

	@ApiProperty({ example: "2026-12-31T23:59:59Z" })
	@Type(() => Date)
	@IsDate()
	public readonly expiresAt!: Date;
}
