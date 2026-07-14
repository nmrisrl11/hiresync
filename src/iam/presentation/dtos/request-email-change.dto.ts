import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class RequestEmailChangeDto {
	@ApiProperty({ description: "The new email address to transition to" })
	@IsEmail({}, { message: "Please provide a valid email address." })
	@IsNotEmpty()
	public readonly newEmail!: string;
}
