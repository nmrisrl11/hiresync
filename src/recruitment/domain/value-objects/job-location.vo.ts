import { LOCATION_TYPE, LocationType } from "../types";

export class JobLocation {
	constructor(
		public readonly type: LocationType,
		public readonly address: string | null = null,
	) {
		if (type !== LOCATION_TYPE.REMOTE && !address) {
			throw new Error("Address must be provided for on-site or hybrid roles.");
		}
	}
}
