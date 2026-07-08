import { IsEmail, IsString, MinLength, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
	@ApiProperty({ example: "Name" })
	@IsString()
	@IsNotEmpty()
	public readonly name!: string;

	@ApiProperty({ example: "email@example.com" })
	@IsEmail()
	public readonly email!: string;

	@ApiProperty({ example: "password123", minLength: 8 })
	@IsString()
	@MinLength(8)
	public readonly password!: string;

	@ApiProperty({ example: "APPLICANT" })
	@IsString()
	@IsNotEmpty()
	public readonly roleCode!: string;
}
