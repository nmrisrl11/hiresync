export const ROLES = {
	ADMIN: "ADMIN",
	EMPLOYER: "EMPLOYER",
	APPLICANT: "APPLICANT",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
