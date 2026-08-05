import { ApiProperty } from "@nestjs/swagger";

export class PublicEmployerProfileResponseDto {
	@ApiProperty({ description: "The unique identifier of the employer." })
	public readonly id!: string;

	@ApiProperty({ description: "The company name." })
	public readonly companyName!: string;

	@ApiProperty({ description: "The company description." })
	public readonly description!: string;

	@ApiProperty({ description: "The company's website URL.", nullable: true })
	public readonly website!: string | null;

	@ApiProperty({ description: "The company's logo URL.", nullable: true })
	public readonly logoUrl!: string | null;

	@ApiProperty({ description: "The industry the company operates in.", nullable: true })
	public readonly industry!: string | null;

	@ApiProperty({ description: "The date the profile was created." })
	public readonly createdAt!: Date;
}
