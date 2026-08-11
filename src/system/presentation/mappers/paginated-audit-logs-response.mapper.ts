import { PaginatedAuditLogResult } from "@/system/application/ports/inbound";
import { PaginatedAuditLogsResponseDto } from "../dtos/responses";

export class PaginatedAuditLogsResponseMapper {
	public static toDto(
		result: PaginatedAuditLogResult,
		limit: number,
		offset: number,
	): PaginatedAuditLogsResponseDto {
		return {
			data: result.items.map((log) => ({
				id: log.id,
				eventName: log.eventName,
				actorId: log.actorId,
				payload: log.payload,
				occurredOn: log.occurredOn,
				createdAt: log.createdAt,
			})),
			meta: {
				totalRecords: result.total,
				count: result.items.length,
				limit,
				offset,
			},
		};
	}
}
