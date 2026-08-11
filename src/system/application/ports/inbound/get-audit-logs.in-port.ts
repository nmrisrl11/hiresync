export class GetAuditLogsQuery {
	constructor(
		public readonly limit: number,
		public readonly offset: number,
		public readonly eventName?: string,
		public readonly actorId?: string,
	) {}
}

export type AuditLogResult = {
	id: string;
	eventName: string;
	actorId: string | null;
	payload: Record<string, unknown>;
	occurredOn: Date;
	createdAt: Date;
};

export type PaginatedAuditLogResult = {
	items: AuditLogResult[];
	total: number;
};

export abstract class GetAuditLogsUseCasePort {
	abstract execute(query: GetAuditLogsQuery): Promise<PaginatedAuditLogResult>;
}
