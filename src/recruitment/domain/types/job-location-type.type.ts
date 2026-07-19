export const LOCATION_TYPE = {
	ON_SITE: "ON_SITE",
	HYBRID: "HYBRID",
	REMOTE: "REMOTE",
} as const;

export type LocationType = (typeof LOCATION_TYPE)[keyof typeof LOCATION_TYPE];
