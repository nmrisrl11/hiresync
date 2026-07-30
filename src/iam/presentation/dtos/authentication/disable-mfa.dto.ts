import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DisableMfaDto {
	@ApiProperty({
		example: "MySecurePassword123!",
		description: "Current account password required to disable multi-factor authentication.",
	})
	@IsString()
	@IsNotEmpty()
	currentPassword!: string;
}
