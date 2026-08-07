import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class ApplyForJobRequestDto {
	@ApiProperty({ description: "The ID of the job listing being applied for." })
	@IsUUID()
	@IsNotEmpty()
	public readonly jobListingId!: string;

	@ApiProperty({ description: "The ID of the stored resume document to use." })
	@IsUUID()
	@IsNotEmpty()
	public readonly resumeDocumentId!: string;

	@ApiPropertyOptional({
		description: "The ID of the stored cover letter document to use (optional).",
	})
	@IsUUID()
	@IsOptional()
	public readonly coverLetterDocumentId?: string;
}
