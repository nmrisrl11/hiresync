import { ApiProperty } from "@nestjs/swagger";

export class CreateJobListingResponseDto {
	@ApiProperty({ description: "The ID of the newly created job listing." })
	public readonly jobId!: string;
}
