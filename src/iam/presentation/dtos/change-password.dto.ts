import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
	@ApiProperty({ description: "The user's current password" })
	@IsString()
	@IsNotEmpty()
	public readonly currentPassword!: string;

	@ApiProperty({ description: "The new password to set", minLength: 8 })
	@IsString()
	@IsNotEmpty()
	@MinLength(8, { message: "Password must be at least 8 characters long." })
	public readonly newPassword!: string;
}
