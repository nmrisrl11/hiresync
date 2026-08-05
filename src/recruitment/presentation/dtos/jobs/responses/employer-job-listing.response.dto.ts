import {
	EMPLOYMENT_TYPE,
	JOB_STATUS,
	LOCATION_TYPE,
	type EmploymentType,
	type JobStatus,
	type LocationType,
} from "@/recruitment/domain/types";
import { ApiProperty } from "@nestjs/swagger";

export class EmployerJobListingResponseDto {
	@ApiProperty() public readonly id!: string;
	@ApiProperty() public readonly employerId!: string;
	@ApiProperty() public readonly title!: string;
	@ApiProperty() public readonly description!: string;
	@ApiProperty({ type: [String] }) public readonly requirements!: string[];
	@ApiProperty({ enum: EMPLOYMENT_TYPE }) public readonly employmentType!: EmploymentType;
	@ApiProperty({ enum: LOCATION_TYPE }) public readonly locationType!: LocationType;
	@ApiProperty({ nullable: true }) public readonly locationAddress!: string | null;
	@ApiProperty({ nullable: true }) public readonly salaryMin!: number | null;
	@ApiProperty({ nullable: true }) public readonly salaryMax!: number | null;
	@ApiProperty() public readonly salaryCurrency!: string;
	@ApiProperty({ example: JOB_STATUS.PUBLISHED, enum: JOB_STATUS })
	public readonly status!: JobStatus;
	@ApiProperty() public readonly createdAt!: Date;
	@ApiProperty({ nullable: true }) public readonly expiresAt!: Date | null;
}
