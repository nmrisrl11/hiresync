# Shared Architecture: Centralized Application Links (`AppLinks`)

## Overview
The `AppLinks` configuration utility (`src/shared/utils/app-links.ts`) provides a single, centralized source of truth for generating Frontend Application UI URLs across the backend services. 

By centralizing URL construction, we eliminate hardcoded routing strings scattered across email notification services, background queue workers, and domain event handlers. This ensures adherence to the Single Responsibility Principle (SRP) and allows frontend route structures to evolve independently of backend email templates.

---

## Architecture & Design Rationale

### 1. Separation of Concerns (Backend API vs. Frontend UI)
Email links clicked by end-users should **never** route directly to raw REST API endpoints (e.g., `/api/auth/verify-email?token=...`). Pointing email links directly to backend APIs causes browsers to execute `GET` requests that return raw JSON strings or empty pages.

Instead, email actions must link to **Frontend UI Pages**, allowing the client application (e.g., Next.js, React) to:
1. Parse URL search parameters (e.g., `token`).
2. Display appropriate loading states or user prompts.
3. Execute the proper HTTP `POST` requests to the backend API (`/api/auth/verify-email`, `/api/auth/reset-password`).
4. Handle success notifications, cookies, and redirects gracefully.

### 2. Immutability & Strict Typing
`AppLinks` is exported using TypeScript's `as const` assertion. This guarantees that all route generators are strictly typed, read-only functions that cannot be mutated at runtime.

---

## Configuration Reference

### File Location
`src/shared/utils/app-links.ts`

### Implementation
```typescript
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
```

---

## Usage Guide

### 1. Using in Email Notification Services
When dispatching emails via `IamEmailService` or `RecruitmentEmailService`, replace hardcoded template context URLs with calls to `AppLinks`.

```typescript
import { AppLinks } from "@/shared/utils/app-links";
import { EmailProviderPort } from "@/shared/email/ports/email-provider.port";
import { Injectable } from "@nestjs/common";

@Injectable()
export class IamEmailService {
	constructor(private readonly mailer: EmailProviderPort) {}

	async sendVerificationEmail(email: string, token: string, expiresInText: string) {
		await this.mailer.sendEmail({
			to: email,
			subject: "Verify your email address",
			template: "iam/verify-email",
			context: {
				//! Cleanly generates: https://app.example.com/auth/verify-email?token=...
				verificationUrl: AppLinks.iam.verifyEmail(token),
				expiresInText,
			},
		});
	}

	async sendMfaEnabledAlertEmail(email: string) {
		await this.mailer.sendEmail({
			to: email,
			subject: "Security Alert: Two-Factor Authentication Enabled",
			template: "iam/mfa-enabled-alert",
			context: {
				//! Cleanly generates: https://app.example.com/account/security
				accountSettingsUrl: AppLinks.iam.accountSecurity(),
			},
		});
	}
}
```

### 2. Adding New Application Routes
When introducing a new feature module that requires email notifications or UI redirections:
1. Open `src/shared/utils/app-links.ts`.
2. Add a new domain namespace (or extend an existing one) inside the exported object.
3. Define route generators as functions—even for static routes—to maintain a consistent invocation API (`AppLinks.module.route()`).

```typescript
export const AppLinks = {
	// ... existing namespaces ...

	//! Billing & Subscription Links
	billing: {
		checkout: (planId: string) => `${BASE_URL}/billing/checkout?plan=${planId}`,
		invoices: () => `${BASE_URL}/billing/invoices`,
	},
} as const;
```
