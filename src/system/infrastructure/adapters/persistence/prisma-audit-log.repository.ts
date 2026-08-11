import { Prisma } from "@/generated/prisma/client";
import { PrismaService } from "@/shared/database/prisma.service";
import { AuditLog } from "@/system/domain/entities";
import { AuditLogRepository, FindAuditLogsFilter } from "@/system/domain/repositories";
import { Injectable } from "@nestjs/common";
import { SystemMapper } from "../../mappers/system.mapper";

@Injectable()
export class PrismaAuditLogRepository implements AuditLogRepository {
	constructor(private readonly prisma: PrismaService) {}

	private buildWhereClause(filter: Partial<FindAuditLogsFilter>): Prisma.AuditLogWhereInput {
		const where: Prisma.AuditLogWhereInput = {};
		if (filter.eventName) where.eventName = filter.eventName;
		if (filter.actorId) where.actorId = filter.actorId;
		return where;
	}

	public async save(auditLog: AuditLog): Promise<void> {
		await this.prisma.auditLog.create({
			data: {
				id: auditLog.id.getValue(),
				eventName: auditLog.eventName,
				actorId: auditLog.actorId,
				payload: auditLog.payload as Prisma.InputJsonValue,
				occurredOn: auditLog.occurredOn,
				createdAt: auditLog.createdAt,
			},
		});
	}

	public async findMany(filter: FindAuditLogsFilter): Promise<AuditLog[]> {
		const records = await this.prisma.auditLog.findMany({
			where: this.buildWhereClause(filter),
			take: filter.limit,
			skip: filter.offset,
			orderBy: { occurredOn: "desc" }, //! Newest logs first
		});

		return records.map((record) => SystemMapper.toAuditLogDomain(record));
	}

	public async count(filter: FindAuditLogsFilter): Promise<number> {
		return await this.prisma.auditLog.count({
			where: this.buildWhereClause(filter),
		});
	}
}
