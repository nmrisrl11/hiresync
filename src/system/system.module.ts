import { DatabaseModule } from "@/shared/database/database.module";
import { Module, Provider } from "@nestjs/common";
import { GetAuditLogsUseCasePort } from "./application/ports/inbound";
import { GetAuditLogsUseCase } from "./application/use-cases";
import { AuditLogRepository } from "./domain/repositories";
import { PrismaAuditLogRepository } from "./infrastructure/adapters/persistence/prisma-audit-log.repository";
import { GlobalAuditLogListener } from "./infrastructure/events/listeners/global-audit-log.listener";
import { SystemAdminController } from "./presentation/controllers/system-admin.controller";

//! Inbound Ports and Use Cases
const inboundPorts: Provider[] = [
	{ provide: GetAuditLogsUseCasePort, useClass: GetAuditLogsUseCase },
];

//! Outbound Ports and Adapters
const outboundPorts: Provider[] = [
	{ provide: AuditLogRepository, useClass: PrismaAuditLogRepository },
];

@Module({
	imports: [DatabaseModule],
	controllers: [SystemAdminController],
	providers: [
		...inboundPorts,
		...outboundPorts,

		//! Event Listeners
		GlobalAuditLogListener,
	],
})
export class SystemModule {}
