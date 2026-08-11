import { AsyncLocalStorage } from "node:async_hooks";

export interface AuditContext {
	ipAddress?: string;
	userAgent?: string;
}

export const auditContextStorage = new AsyncLocalStorage<AuditContext>();
