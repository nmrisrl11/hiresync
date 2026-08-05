import { APPLICATION_STATUS, type ApplicationStatus } from "@/recruitment/domain/types";
import { ApiProperty } from "@nestjs/swagger";

export class ApplicantApplicationResponseDto {
	@ApiProperty()
	public readonly id!: string;

	@ApiProperty()
	public readonly jobListingId!: string;

	@ApiProperty()
	public readonly employerId!: string;

	@ApiProperty({ enum: APPLICATION_STATUS })
	public readonly status!: ApplicationStatus;

	@ApiProperty()
	public readonly resumeUrl!: string;

	@ApiProperty({ nullable: true })
	public readonly coverLetterUrl!: string | null;

	@ApiProperty()
	public readonly appliedAt!: Date;

	@ApiProperty()
	public readonly updatedAt!: Date;
}
