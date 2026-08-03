import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class SetInitialPasswordDto {
	@ApiProperty({ description: "The new password to set for the OAuth-only account", minLength: 8 })
	@IsString()
	@IsNotEmpty()
	@MinLength(8, { message: "Password must be at least 8 characters long." })
	public readonly newPassword!: string;
}
