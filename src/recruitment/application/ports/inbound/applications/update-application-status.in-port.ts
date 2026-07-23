import { ApplicationStatus } from "@/recruitment/domain/types";

export class UpdateApplicationStatusCommand {
	constructor(
		public readonly employerId: string,
		public readonly applicationId: string,
		public readonly newStatus: ApplicationStatus,
	) {}
}

export abstract class UpdateApplicationStatusUseCasePort {
	abstract execute(command: UpdateApplicationStatusCommand): Promise<void>;
}
