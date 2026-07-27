import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateInternalNoteDto {
	@ApiPropertyOptional({
		description: "Internal note for the application. Send null or empty string to clear.",
		example: "Great portfolio, scheduling interview for next week.",
	})
	@IsOptional()
	@IsString()
	@MaxLength(2000)
	note?: string | null;
}
