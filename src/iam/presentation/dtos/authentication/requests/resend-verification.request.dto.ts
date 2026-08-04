import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResendVerificationRequestDto {
	@ApiProperty({ example: "email@example.com" })
	@IsEmail()
	@IsNotEmpty()
	public readonly email!: string;
}
