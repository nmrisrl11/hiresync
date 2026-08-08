import { ApplicationEventType } from "@/recruitment/domain/types";

export class GetApplicationHistoryQuery {
	constructor(
		public readonly userId: string,
		public readonly applicationId: string,
		public readonly isEmployer: boolean,
	) {}
}

export type ApplicationHistoryResult = {
	id: string;
	eventType: ApplicationEventType;
	message: string;
	metadata: Record<string, unknown> | null;
	isPublic: boolean;
	createdAt: Date;
};

export abstract class GetApplicationHistoryUseCasePort {
	abstract execute(query: GetApplicationHistoryQuery): Promise<ApplicationHistoryResult[]>;
}
