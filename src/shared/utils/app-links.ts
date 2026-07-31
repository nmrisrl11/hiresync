import { env } from "@/env";

const BASE_URL = env.APP_URL;

export const AppLinks = {
	//! IAM / Auth Frontend UI Links
	iam: {
		verifyEmail: (token: string) => `${BASE_URL}/auth/verify-email?token=${token}`,
		resetPassword: (token: string) => `${BASE_URL}/auth/reset-password?token=${token}`,
		confirmEmailChange: (token: string) => `${BASE_URL}/account/change-email?token=${token}`,
		login: () => `${BASE_URL}/login`,
		support: () => `${BASE_URL}/support`,
		dashboard: () => `${BASE_URL}/dashboard`,
		accountSecurity: () => `${BASE_URL}/account/security`,
	},

	//! Recruitment / Job Portal Frontend UI Links
	recruitment: {
		employerDashboard: () => `${BASE_URL}/employer/dashboard`,
		employerJobs: () => `${BASE_URL}/employer/jobs`,
		employerApplications: () => `${BASE_URL}/employer/applications`,
		applicantJobs: () => `${BASE_URL}/jobs`,
		applicantApplications: () => `${BASE_URL}/applicant/applications`,
	},
} as const;
