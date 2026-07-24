import { ApplicationStatus } from "@/recruitment/domain/types";

export class EnqueueApplicationStatusUpdatedCommand {
	constructor(
		public readonly applicationId: string,
		public readonly applicantId: string,
		public readonly newStatus: ApplicationStatus,
	) {}
}

export abstract class EnqueueApplicationStatusUpdatedUseCasePort {
	abstract execute(command: EnqueueApplicationStatusUpdatedCommand): Promise<void>;
}
