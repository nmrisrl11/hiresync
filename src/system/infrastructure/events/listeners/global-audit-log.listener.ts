import { DomainEvent, IntegrationEvent } from "@/shared/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { IdGeneratorPort } from "@/shared/utils/ports";
import { AuditLog } from "@/system/domain/entities";
import { AuditLogRepository } from "@/system/domain/repositories";
import { AuditLogId } from "@/system/domain/value-objects";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class GlobalAuditLogListener implements OnModuleInit {
	constructor(
		private readonly eventEmitter: EventEmitter2,
		private readonly auditLogRepository: AuditLogRepository,
		private readonly idGenerator: IdGeneratorPort,
		private readonly logger: LoggerPort,
	) {}

	public onModuleInit(): void {
		//! Bind to ALL events emitted through the system using a synchronous wrapper
		this.eventEmitter.onAny((eventName: string | string[], event: unknown) => {
			this.handleEvent(eventName, event).catch((error) => {
				this.logger.error(
					`Unhandled error logging event: ${String(eventName)}`,
					error instanceof Error ? error.stack : "Unknown error",
				);
			});
		});
	}

	private async handleEvent(eventName: string | string[], event: unknown): Promise<void> {
		// Ensure the event is one of our base event classes before logging
		if (!(event instanceof DomainEvent) && !(event instanceof IntegrationEvent)) return;

		const eventNameStr = Array.isArray(eventName) ? eventName.join(".") : eventName;
		const payload = this.serializePayload(event);
		const actorId = this.extractActorId(payload);

		const auditLog = new AuditLog(
			new AuditLogId(this.idGenerator.generateId()),
			eventNameStr,
			actorId,
			payload,
			event.occurredOn,
			new Date(),
		);

		await this.auditLogRepository.save(auditLog);
	}

	//! Safely extracts the user/actor identity based on common property names in events
	private extractActorId(payload: Record<string, unknown>): string | null {
		if (typeof payload.userId === "string") return payload.userId;
		if (typeof payload.employerId === "string") return payload.employerId;
		if (typeof payload.applicantId === "string") return payload.applicantId;
		return null;
	}

	//! Converts the class instance to a plain object, handling Dates
	private serializePayload(event: unknown): Record<string, unknown> {
		try {
			return JSON.parse(JSON.stringify(event)) as Record<string, unknown>;
		} catch {
			return { unparseable: true };
		}
	}
}
