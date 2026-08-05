import { ApiProperty } from "@nestjs/swagger";

export class SavedJobResponseDto {
	@ApiProperty()
	public readonly id!: string;

	@ApiProperty()
	public readonly employerId!: string;

	@ApiProperty()
	public readonly title!: string;

	@ApiProperty()
	public readonly locationType!: string;

	@ApiProperty({ nullable: true })
	public readonly locationAddress!: string | null;

	@ApiProperty()
	public readonly employmentType!: string;

	@ApiProperty({ nullable: true })
	public readonly salaryMin!: number | null;

	@ApiProperty({ nullable: true })
	public readonly salaryMax!: number | null;

	@ApiProperty()
	public readonly salaryCurrency!: string;

	@ApiProperty()
	public readonly status!: string;

	@ApiProperty()
	public readonly createdAt!: Date;
}
