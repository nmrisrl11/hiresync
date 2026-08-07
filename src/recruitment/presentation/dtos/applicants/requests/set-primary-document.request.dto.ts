import { DOCUMENT_TYPE, type DocumentType } from "@/recruitment/domain/types";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";

export class SetPrimaryDocumentRequestDto {
	@ApiProperty({ enum: DOCUMENT_TYPE, description: "The type of document being set as primary." })
	@IsEnum(DOCUMENT_TYPE)
	@IsNotEmpty()
	public readonly type!: DocumentType;
}
