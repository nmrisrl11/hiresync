import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordRequestDto {
	@ApiProperty({ example: "email@example.com" })
	@IsEmail()
	@IsNotEmpty()
	public readonly email!: string;
}
