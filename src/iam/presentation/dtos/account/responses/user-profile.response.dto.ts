import { ApiProperty } from "@nestjs/swagger";

export class UserProfileResponseDto {
	@ApiProperty({ description: "The unique identifier of the user." })
	public readonly id!: string;

	@ApiProperty({ description: "The primary email address of the user." })
	public readonly email!: string;

	@ApiProperty({ description: "The user's display name.", nullable: true })
	public readonly name!: string | null;

	@ApiProperty({ description: "The URL of the user's avatar image.", nullable: true })
	public readonly image!: string | null;

	@ApiProperty({ description: "The designated role code of the user." })
	public readonly role!: string;

	@ApiProperty({ description: "Whether the user has verified their email address." })
	public readonly isVerified!: boolean;

	@ApiProperty({ description: "Whether the account has a password set (used for OAuth accounts)." })
	public readonly hasPassword!: boolean;

	@ApiProperty({ description: "The timestamp when the user account was created." })
	public readonly createdAt!: Date;
}
