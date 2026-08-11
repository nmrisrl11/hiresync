import { AuditLog as PrismaAuditLog } from "@/generated/prisma/client";
import { AuditLog } from "@/system/domain/entities";
import { AuditLogId } from "@/system/domain/value-objects";

export class SystemMapper {
	public static toAuditLogDomain(raw: PrismaAuditLog): AuditLog {
		return new AuditLog(
			new AuditLogId(raw.id),
			raw.eventName,
			raw.actorId,
			raw.payload as Record<string, unknown>,
			raw.occurredOn,
			raw.createdAt,
		);
	}
}
