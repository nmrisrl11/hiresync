import { ApplicationHistoryResult } from "@/recruitment/application/ports/inbound/applications";
import { ApplicationHistoryResponseDto } from "../../dtos/applications";

export class ApplicationHistoryResponseMapper {
	public static toDtoList(results: ApplicationHistoryResult[]): ApplicationHistoryResponseDto[] {
		return results.map((result) => ({
			id: result.id,
			eventType: result.eventType,
			message: result.message,
			metadata: result.metadata,
			isPublic: result.isPublic,
			createdAt: result.createdAt,
		}));
	}
}
