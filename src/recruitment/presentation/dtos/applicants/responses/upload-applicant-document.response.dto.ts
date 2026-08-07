import { ApiProperty } from "@nestjs/swagger";

export class UploadApplicantDocumentResponseDto {
	@ApiProperty({ description: "The unique ID of the newly uploaded document." })
	public readonly id!: string;

	@ApiProperty({ description: "The storage key/reference of the file." })
	public readonly fileKey!: string;
}
