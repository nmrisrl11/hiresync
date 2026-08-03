import { ApiProperty } from "@nestjs/swagger";

export class MfaEnableResponseDto {
	@ApiProperty({ type: [String], description: "List of 10 single-use backup recovery codes." })
	public readonly backupCodes!: string[];
}
