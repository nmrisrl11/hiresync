import { AuditLog } from "../entities";

export interface FindAuditLogsFilter {
	limit: number;
	offset: number;
	eventName?: string;
	actorId?: string;
}

export abstract class AuditLogRepository {
	abstract save(auditLog: AuditLog): Promise<void>;
	abstract findMany(filter: FindAuditLogsFilter): Promise<AuditLog[]>;
	abstract count(filter: FindAuditLogsFilter): Promise<number>;
}
