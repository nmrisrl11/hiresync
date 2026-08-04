import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class MfaLoginRequestDto {
	@ApiProperty({
		example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		description: "The short-lived MFA challenge token returned from the initial login attempt.",
	})
	@IsString()
	@IsNotEmpty()
	mfaChallengeToken!: string;

	@ApiProperty({
		example: "123456",
		description: "The 6-digit TOTP code from an authenticator app or an 8-character backup code.",
	})
	@IsString()
	@IsNotEmpty()
	code!: string;
}
