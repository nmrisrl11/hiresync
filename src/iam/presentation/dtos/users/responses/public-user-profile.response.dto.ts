import { ApiProperty } from "@nestjs/swagger";

export class PublicUserProfileResponseDto {
	@ApiProperty({ description: "The unique identifier of the user." })
	public readonly id!: string;

	@ApiProperty({ description: "The user's display name.", nullable: true })
	public readonly name!: string | null;

	@ApiProperty({ description: "The URL of the user's avatar image.", nullable: true })
	public readonly image!: string | null;

	@ApiProperty({ description: "The role code of the user." })
	public readonly role!: string;
}
