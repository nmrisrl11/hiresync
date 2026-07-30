import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class EnableMfaDto {
	@ApiProperty({
		example: "123456",
		description: "The 6-digit TOTP verification code from your authenticator app.",
	})
	@IsString()
	@IsNotEmpty()
	@Length(6, 6)
	code!: string;
}
