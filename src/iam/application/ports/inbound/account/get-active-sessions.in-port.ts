export class GetActiveSessionsQuery {
	constructor(public readonly userId: string) {}
}

export type ActiveSessionResult = {
	id: string;
	userAgent: string | null;
	ipAddress: string | null;
	lastActiveAt: Date;
	isCurrentDevice: boolean;
};

export abstract class GetActiveSessionsUseCasePort {
	abstract execute(
		query: GetActiveSessionsQuery,
		currentSessionId: string,
	): Promise<ActiveSessionResult[]>;
}
