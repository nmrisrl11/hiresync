import { ApplicationStatus } from "@/recruitment/domain/types";

export class BulkUpdateApplicationStatusCommand {
	constructor(
		public readonly employerUserId: string,
		public readonly applicationIds: string[],
		public readonly newStatus: ApplicationStatus,
	) {}
}

export abstract class BulkUpdateApplicationStatusUseCasePort {
	abstract execute(command: BulkUpdateApplicationStatusCommand): Promise<void>;
}
