import { IsEmail, IsString, MinLength, IsNotEmpty, IsIn } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export const ALLOWED_REGISTRATION_ROLES = ["EMPLOYER", "APPLICANT"];

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

	@ApiProperty({ example: "APPLICANT", enum: ALLOWED_REGISTRATION_ROLES })
	@IsString()
	@IsNotEmpty()
	@IsIn(ALLOWED_REGISTRATION_ROLES, {
		message: `roleCode must be one of the following values: ${ALLOWED_REGISTRATION_ROLES.join(", ")}`,
	})
	public readonly roleCode!: string;
}
