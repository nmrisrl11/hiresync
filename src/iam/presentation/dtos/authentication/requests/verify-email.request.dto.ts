import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class VerifyEmailRequestDto {
	@ApiProperty({ example: "ABCDE12345", minLength: 10 })
	@IsString()
	@IsNotEmpty()
	public readonly token!: string;
}
