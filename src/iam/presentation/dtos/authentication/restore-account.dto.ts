import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RestoreAccountDto {
	@ApiProperty({ example: "email@example.com" })
	@IsEmail({}, { message: "Please provide a valid email address." })
	@IsNotEmpty()
	email!: string;

	@ApiProperty({ example: "password123" })
	@IsString()
	@IsNotEmpty()
	password!: string;
}
