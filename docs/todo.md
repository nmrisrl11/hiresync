# HireSync - Todos

# Phase 1

## **IAM (Identity and Access Management) Module**

### Authentication
- [x] Registration
- [x] Login
- [x] Logout
- [x] Assigning and Verifying JWT Access and Refresh Tokens
- [x] Password Hashing with bcrypt
- [x] Email Verification with nodemailer and resend
- [x] Forgot Password
- [x] Reset Password
- [x] Refresh Access Token with refresh token
- [x] Resending Email Verification
    #### Email Notifications
    - [x] Welcome Email
    - [x] Farewell (Deleted Account) Email
    - [x] Send and Resend Verification Email
    - [x] Forgot and Change Password
    - [x] Request and Confirmation of Changing Email

### User
- [x] Create User
- [x] Get Current Authenticated User
- [x] Get Users (Admin)
- [x] Get User by ID (Admin)
- [x] Get User by ID (Public)
- [x] Update User
- [x] Delete User (Delete avatar, company logo, resume , cover letter)

### Role
- [/] Create Role
- [x] Get Roles
- [/] Get Role by ID
- [/] Update Role
- [/] Delete Role

## **Recruitment Module**

### Employers
- [x] Create company profile
- [x] Edit company profile
- [x] Upload/Remove company profile logo
- [x] Get/View company profile
- [x] Get company profile by ID
    #### Email Notifications
    - [x] Created company profile
    - [/] Updated company profile

### Job Listings
- [x] Create job listing
- [x] Edit job listing
- [x] Delete/Close job listing
- [x] Get/View job listing
- [x] Get job listing by ID
- [x] Filter job listings
- [x] Search job listings
- [x] Paginated job listing
    #### Email Notifications
    - [x] Created job listing
    - [/] Updated job listing
    - [x] Closed job listing
    - [x] Expired job listing - with Task job using CRON?

### Applicants
- [x] Create applicant profile
- [x] Edit applicant profile
- [x] Get/View applicant profile
    #### Email Notifications
    - [x] Created applicant profile

### Job Applications
- Applicants can:
    - [x] Apply for jobs
    - [x] Upload resumes
    - [x] Upload cover letters
    - [x] Get/View submitted applications
    - [x] Withdraw application
    - [x] Save/Bookmark job listing
    - [x] Unsave/Unbookmark job listing
    - [x] Get saved/bookmarked job listings
    - [/] Track application status
        #### File Uploading
        - [x] Resume in PDF
        - [x] Cover letter in TXT
        #### Email Notifications
        - [x] Application submitted
        - [x] Application status updated
- Employers can:
    - [x] Get/View applications
    - [x] Update application status
    - [x] Bulk update application status
    - [x] Internal application review/note
    - [x] Get/View applicants who applied for jobs
    - [/] Review uploaded resumes and cover letters
        #### Email Notifications
        - [x] New application received
        - [x] Application withdrawn

## **Third-Party Service Integrations**

### Email Services
- [x] Integrate nodemailer
- [x] Integrate resend

### Image and Documents Storage
- [x] Cloudinary integration
- [x] Upload/Remove Account Avatar
- [x] Upload/Remove Company Profile Logo
- [x] Uploading of Resumes in PDF format
- [x] Uploading of Cover Letters in TXT format

### Rate Limiting
- [x] Integrate rate limiting middleware (NestJS Throttler)
- [x] Implement rate limiting for API endpoints

### Background Queueing
- [x] Integrate background queueing (NestJS BullMQ + Redis)
- [x] Implement background queueing for email notifications

### Event-Driven (Domain and Integration Events)
- [x] Integrate with event-driven architecture (NestJS Event Emitter)
- [x] Move email background queueing with event-driven

### Tasks Scheduling
- [x] Integrate tasks scheduling (NestJS Cron/Schedule)
- [x] Implement task scheduling to expire job listings
- [ ] Remove expired tokens (verification & reset tokens)
- [ ] Send reminder to employers about expiring job listings

## **To add on IAM (Identity and Access Management)**
- [x] Update Password (Authenticated)
  - A secure flow for logged-in users to change their password by validating their old password hash before accepting a new password.

- [x] Update Email Address
  - A dual-step flow that generates a new verification token and sends it to the new email address before updating the actual database record, preventing accidental account lockouts.

- [x] Account Deletion
  - A compliance-driven feature (GDPR/CCPA) that permanently deletes the user's identity, invalidates all tokens, and scrubs associated account data.

- [ ] Account Lockout (Brute Force Protection)
  - Track consecutive failed login attempts and temporarily lock the account (e.g., 15 minutes) after exceeding a threshold.

- [ ] Multi-Factor Authentication (MFA / 2FA)
  - Implement TOTP authentication using apps like Google Authenticator or Authy.

- [ ] Multi-Device Session Management
  - Replace the single refreshTokenHash with a Session entity (one-to-many) to allow users to manage active sessions.

- [ ] Manual OAuth Integration
  - Build custom authorization flows for Google, GitHub, Microsoft, etc., without relying on third-party UI libraries.

# Phase 2

### Employers
- [ ] Company profile Allowing multiple User accounts (with a "Recruiter" role) to attach to a single Employer entity.

### Applicants
- [ ] Multiple Resumes - Allowing them to store up to 3–5 resumes and select which one to attach during the "Apply" flow significantly improves their experience.
- [ ] Application History Timeline - A visual timeline on the applicant's side showing exactly when they applied, when the status changed, and when the employer left a note (if you choose to make certain notes public).

### System & Compliance
- [ ] Audit Logging (Activity History): Track "who did what and when" (e.g., "User A updated Job Listing B on Date C"). This is critical for resolving disputes or tracking recruiter activity.
- [ ] Data Export (GDPR/CCPA): Since you already planned Account Deletion, adding a way for users to download their data payload as a JSON file completes the privacy compliance loop.
