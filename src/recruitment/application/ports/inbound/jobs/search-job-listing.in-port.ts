import { EmploymentType, LocationType } from "@/recruitment/domain/types";
import { PublicJobListingResult } from "./get-job-listing-by-id.in-port";

export class SearchJobListingQuery {
	constructor(
		public readonly limit: number,
		public readonly offset: number,
		public readonly searchQuery?: string,
		public readonly employmentType?: EmploymentType,
		public readonly locationType?: LocationType,
	) {}
}

export abstract class SearchJobListingUseCasePort {
	abstract execute(
		query: SearchJobListingQuery,
	): Promise<{ items: PublicJobListingResult[]; total: number }>;
}
