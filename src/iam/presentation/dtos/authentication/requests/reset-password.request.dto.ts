import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordRequestDto {
	@ApiProperty({ example: "ABCDE12345", minLength: 10 })
	@IsString()
	@IsNotEmpty()
	token!: string;

	@ApiProperty({ example: "password123", minLength: 8 })
	@IsString()
	@MinLength(8)
	newPassword!: string;
}
