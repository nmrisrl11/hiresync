import { ApplicationEventType } from "../types";
import { JobApplicationHistoryId, JobApplicationId } from "../value-objects";

export class JobApplicationHistory {
	constructor(
		public readonly id: JobApplicationHistoryId,
		public readonly jobApplicationId: JobApplicationId,
		public readonly eventType: ApplicationEventType,
		public readonly message: string,
		public readonly metadata: Record<string, unknown> | null,
		public readonly isPublic: boolean,
		public readonly createdAt: Date,
	) {}
}
