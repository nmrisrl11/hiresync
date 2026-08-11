import { AuditLogId } from "../value-objects";

export class AuditLog {
	constructor(
		public readonly id: AuditLogId,
		public readonly eventName: string,
		public readonly actorId: string | null,
		public readonly payload: Record<string, unknown>,
		public readonly occurredOn: Date,
		public readonly createdAt: Date,
	) {}
}
