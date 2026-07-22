import { EmploymentType, LocationType } from "@/recruitment/domain/types";

export class EditJobListingCommand {
	constructor(
		public readonly userId: string,
		public readonly jobListingId: string,
		public readonly title: string,
		public readonly description: string,
		public readonly requirements: string[],
		public readonly employmentType: EmploymentType,
		public readonly locationType: LocationType,
		public readonly locationAddress: string | null,
		public readonly salaryMin: number | null,
		public readonly salaryMax: number | null,
		public readonly salaryCurrency: string,
	) {}
}

export abstract class EditJobListingUseCasePort {
	abstract execute(command: EditJobListingCommand): Promise<void>;
}
