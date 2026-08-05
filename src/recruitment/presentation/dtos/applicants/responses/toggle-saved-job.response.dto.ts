import { ApiProperty } from "@nestjs/swagger";

export class ToggleSavedJobResponseDto {
	@ApiProperty({ description: "True if the job was saved, false if it was removed." })
	public readonly saved!: boolean;
}
