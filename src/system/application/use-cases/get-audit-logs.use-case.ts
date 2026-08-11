import { AuditLogRepository } from "@/system/domain/repositories";
import { Injectable } from "@nestjs/common";
import {
	GetAuditLogsQuery,
	GetAuditLogsUseCasePort,
	PaginatedAuditLogResult,
} from "../ports/inbound";

@Injectable()
export class GetAuditLogsUseCase implements GetAuditLogsUseCasePort {
	constructor(private readonly auditLogRepository: AuditLogRepository) {}

	public async execute(query: GetAuditLogsQuery): Promise<PaginatedAuditLogResult> {
		const filter = {
			limit: query.limit,
			offset: query.offset,
			eventName: query.eventName,
			actorId: query.actorId,
		};

		const [logs, total] = await Promise.all([
			this.auditLogRepository.findMany(filter),
			this.auditLogRepository.count(filter),
		]);

		return {
			items: logs.map((log) => ({
				id: log.id.getValue(),
				eventName: log.eventName,
				actorId: log.actorId,
				payload: log.payload,
				occurredOn: log.occurredOn,
				createdAt: log.createdAt,
			})),
			total,
		};
	}
}
