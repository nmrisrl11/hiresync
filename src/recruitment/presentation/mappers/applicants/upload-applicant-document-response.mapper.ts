import { UploadApplicantDocumentResult } from "@/recruitment/application/ports/inbound/applicants";
import { UploadApplicantDocumentResponseDto } from "../../dtos/applicants";

export class UploadApplicantDocumentResponseMapper {
	public static toDto(result: UploadApplicantDocumentResult): UploadApplicantDocumentResponseDto {
		return {
			id: result.id,
			fileKey: result.fileKey,
		};
	}
}
