import {
	EMPLOYMENT_TYPE,
	type EmploymentType,
	JOB_STATUS,
	type JobStatus,
	LOCATION_TYPE,
	type LocationType,
} from "@/recruitment/domain/types";
import { ApiProperty } from "@nestjs/swagger";

export class SavedJobResponseDto {
	@ApiProperty()
	public readonly id!: string;

	@ApiProperty()
	public readonly employerId!: string;

	@ApiProperty()
	public readonly title!: string;

	@ApiProperty({ enum: LOCATION_TYPE })
	public readonly locationType!: LocationType;

	@ApiProperty({ nullable: true })
	public readonly locationAddress!: string | null;

	@ApiProperty({ enum: EMPLOYMENT_TYPE })
	public readonly employmentType!: EmploymentType;

	@ApiProperty({ nullable: true })
	public readonly salaryMin!: number | null;

	@ApiProperty({ nullable: true })
	public readonly salaryMax!: number | null;

	@ApiProperty()
	public readonly salaryCurrency!: string;

	@ApiProperty({ example: JOB_STATUS.PUBLISHED, enum: JOB_STATUS })
	public readonly status!: JobStatus;

	@ApiProperty()
	public readonly createdAt!: Date;
}
