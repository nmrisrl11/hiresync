export const APPLICATION_STATUS = {
	PENDING: "PENDING", // Just applied
	REVIEWING: "REVIEWING", // Employer opened the application
	SHORTLISTED: "SHORTLISTED", // Employer marked as potential fit
	REJECTED: "REJECTED", // Employer passed on candidate
	HIRED: "HIRED", // Candidate accepted the job
	WITHDRAWN: "WITHDRAWN", // Applicant withdrew their application
} as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];
