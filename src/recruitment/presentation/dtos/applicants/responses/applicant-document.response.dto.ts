import { DOCUMENT_TYPE, type DocumentType } from "@/recruitment/domain/types";
import { ApiProperty } from "@nestjs/swagger";

export class ApplicantDocumentResponseDto {
	@ApiProperty() public readonly id!: string;
	@ApiProperty({ enum: DOCUMENT_TYPE }) public readonly type!: DocumentType;
	@ApiProperty() public readonly originalFilename!: string;
	@ApiProperty() public readonly fileKey!: string;
	@ApiProperty() public readonly isPrimary!: boolean;
	@ApiProperty() public readonly createdAt!: Date;
	@ApiProperty() public readonly updatedAt!: Date;
}
