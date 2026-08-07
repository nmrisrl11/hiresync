import { ApplicantDocumentResult } from "@/recruitment/application/ports/inbound/applicants";
import { ApplicantDocumentResponseDto } from "../../dtos/applicants";

export class ApplicantDocumentResponseMapper {
	public static toDtoList(results: ApplicantDocumentResult[]): ApplicantDocumentResponseDto[] {
		return results.map((result) => ({
			id: result.id,
			type: result.type,
			originalFilename: result.originalFilename,
			fileKey: result.fileKey,
			isPrimary: result.isPrimary,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
		}));
	}
}
