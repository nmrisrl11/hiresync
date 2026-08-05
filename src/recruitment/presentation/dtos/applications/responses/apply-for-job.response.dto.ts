import { ApiProperty } from "@nestjs/swagger";

export class ApplyForJobResponseDto {
	@ApiProperty({ description: "The ID of the newly submitted application." })
	public readonly applicationId!: string;
}
