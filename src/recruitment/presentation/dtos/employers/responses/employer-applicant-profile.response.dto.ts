import { ApiProperty } from "@nestjs/swagger";

export class EmployerApplicantProfileResponseDto {
	@ApiProperty({ description: "The unique identifier of the applicant profile." })
	public readonly id!: string;

	@ApiProperty({ description: "The user ID associated with this profile." })
	public readonly userId!: string;

	@ApiProperty({ description: "Applicant's first name." })
	public readonly firstName!: string;

	@ApiProperty({ description: "Applicant's last name." })
	public readonly lastName!: string;

	@ApiProperty({ description: "Professional headline.", nullable: true })
	public readonly headline!: string | null;

	@ApiProperty({ description: "Detailed biography.", nullable: true })
	public readonly bio!: string | null;
}
