import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordDto {
	@ApiProperty({ example: "email@example.com" })
	@IsEmail()
	@IsNotEmpty()
	public readonly email!: string;
}
