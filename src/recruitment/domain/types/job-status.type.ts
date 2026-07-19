export const JOB_STATUS = {
	DRAFT: "DRAFT",
	PUBLISHED: "PUBLISHED",
	CLOSED: "CLOSED",
	EXPIRED: "EXPIRED",
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];
