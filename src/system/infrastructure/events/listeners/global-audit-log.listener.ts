import { DomainEvent, IntegrationEvent } from "@/shared/events";
import { auditContextStorage } from "@/shared/http/context";
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

	//! These keys should never be persisted in plaintext audit logs
	private readonly SENSITIVE_KEYS = new Set([
		"password",
		"passwordHash",
		"token",
		"verificationToken",
		"resetToken",
		"refreshToken",
		"secret",
		"mfaSecret",
		"backupCodes",
		"cvv",
		"creditCard",
	]);

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

		const rawEventName = Array.isArray(eventName) ? eventName.join(".") : eventName;
		const formattedEventName = this.formatEventName(rawEventName);

		const payload = this.serializePayload(event);
		const actorId = this.extractActorId(payload);

		const httpContext = auditContextStorage.getStore();

		const enhancedPayload = {
			...payload,
			_meta: {
				ipAddress: httpContext?.ipAddress ?? null,
				userAgent: httpContext?.userAgent ?? null,
			},
		};

		const auditLog = new AuditLog(
			new AuditLogId(this.idGenerator.generateId()),
			formattedEventName,
			actorId,
			enhancedPayload,
			event.occurredOn,
			new Date(),
		);

		await this.auditLogRepository.save(auditLog);
	}

	//! Safely extracts the user/actor identity using a predictable convention
	private extractActorId(payload: Record<string, unknown>): string | null {
		// Explicit override for ambiguous/multi-actor events
		if (typeof payload.actorId === "string") return payload.actorId;
		if (typeof payload.initiatorId === "string") return payload.initiatorId;

		// Standard single-actor fallbacks
		if (typeof payload.userId === "string") return payload.userId;
		if (typeof payload.accountId === "string") return payload.accountId;

		// Mutually exclusive role checks
		const hasApplicant = typeof payload.applicantId === "string";
		const hasEmployer = typeof payload.employerId === "string";

		if (hasApplicant && !hasEmployer) return payload.applicantId as string;
		if (hasEmployer && !hasApplicant) return payload.employerId as string;

		// If both exist and no explicit actorId is provided, return null to avoid false attribution
		return null;
	}

	//! Converts the class instance to a plain object and redacts sensitive information
	private serializePayload(event: unknown): Record<string, unknown> {
		try {
			const parsed = JSON.parse(JSON.stringify(event)) as Record<string, unknown>;
			return this.redactSensitiveData(parsed);
		} catch {
			return { unparseable: true };
		}
	}

	//! Recursively walks the object and replaces sensitive values with a placeholder
	private redactSensitiveData(obj: Record<string, unknown>): Record<string, unknown> {
		const redactedObj: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(obj)) {
			if (this.SENSITIVE_KEYS.has(key)) {
				redactedObj[key] = "[REDACTED]";
			} else if (value !== null && typeof value === "object") {
				if (Array.isArray(value)) {
					redactedObj[key] = value.map((item: unknown) =>
						typeof item === "object" && item !== null
							? this.redactSensitiveData(item as Record<string, unknown>)
							: item,
					);
				} else {
					redactedObj[key] = this.redactSensitiveData(value as Record<string, unknown>);
				}
			} else {
				redactedObj[key] = value;
			}
		}

		return redactedObj;
	}

	//! Normalizes non-alphanumeric separators, acronyms, and formats to SCREAMING_SNAKE_CASE
	private formatEventName(className: string): string {
		return className
			.replace(/(DomainEvent|IntegrationEvent)$/, "") //! Remove the suffixes
			.replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2") //! Handle acronym boundaries
			.replace(/([a-z0-9])([A-Z])/g, "$1_$2") //! Add underscore before capitals
			.replace(/[^A-Za-z0-9]+/g, "_") //! Normalize non-alphanumeric (like array dots)
			.replace(/^_+|_+$/g, "") //! Remove leading/trailing underscores
			.toUpperCase(); //! Capitalize everything
	}
}
