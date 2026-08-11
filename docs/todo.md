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
- [/] Remove expired tokens (verification & reset tokens)
- [ ] Send reminder to employers about expiring job listings

# Phase 2

### IAM (Identity and Access Management) 

### Update Password (Authenticated)
- [x] Allow logged-in users to change their password
- [x] Validate old password hash before accepting a new password

### Update Email Address
- [x] Allow logged-in users to update their email address
- [x] Validate old email address before accepting a new one
- [x] Send verification email to the old email address before updating

### Account Deletion
- [x] User account deletion that permanently deletes the user's identity, invalidates all tokens, and scrubs associated account data.  
- [x] 14 days before permanently deleting the account
- [x] Background job to delete the account after the grace period

### Account Lockout (Brute Force Protection)
- [x] Track consecutive failed login attempts
- [x] Lockout after consecutive failed login attempts (e.g., 5 consecutive failures)
- [x] Locked until 15 minutes after consecutive failed login attempts
- [x] Unlock account after successful login

### Multi-Device Session Management
- [x] Get active sessions
- [x] Revoke all sessions
- [x] Revoke specific session
- [x] Revoke session when password is changed
- [x] Revoke session when password is reset  
- [x] Schedule task to clean expired sessions from the database
- [ ] Detect unusual activity (new country, impossible travel, etc.)
- [ ] Limit the number of active sessions per user

### Multi-Factor Authentication (MFA / 2FA)
- [x] Implement TOTP authentication with Speakeasy
- [x] Generating MFA secret key
- [x] Generating QR code for MFA setup
- [x] Generating of 10 backup codes when enabled
- [x] Disabling of MFA
- [x] Intercept Login flow when MFA is enabled
- [x] Login with MFA
    ### Email Notifications
    - [x] Send email when MFA is enabled
    - [x] Send email when MFA is disabled

Manual OAuth Integration
- [x] Generate the secure redirect URL for the requested OAuth provider
- [x] Handle the OAuth callback from the requested OAuth provider
- [x] Add Google OAuth support
- [ ] Add GitHub OAuth support
- [ ] Add Microsoft OAuth support  
- [x] Set initial password for OAuth users
- [x] Display OAuth provider links on the user profile
- [x] Link to OAuth Provider 
- [x] Unlink OAuth Provider

### Employers
- [ ] Company profile Allowing multiple User accounts (with a "Recruiter" role) to attach to a single Employer entity.

### Applicants
Multiple Resumes and Cover Letters
- [x] Get all documents of an applicant (resume and cover letter)
- [x] Upload resume up to 5 times
- [x] Upload cover letter up to 5 times
- [x] Deleting of resumes and cover letters
- [x] Setting of default resume and cover letter
- [x] Allow user to set which resume and cover letter to use during the "Apply" flow

Application History Timeline
- [x] Get history of specific application for an applicant
- [x] Get history of specific application for employer
- Record a history when:
    - [x] Application is submitted
    - [x] Application status is updated
    - [x] Application is withdrawn
    - [x] Note is added
Notes: 
- Include the internal note on getting of applications using employer
- Add who added or updated the note when the company profile will have a multiple recruiter

### System & Compliance
Audit Logging
- [x] Global audit logging (Activity History)
- [x] Catch every event and persist it to the audit log
- [x] Redact sensitive data from audit log payloads
Data Export
- [ ] Data Export (GDPR/CCPA): Since you already planned Account Deletion, adding a way for users to download their data payload as a JSON file completes the privacy compliance loop.

# Phase 3

### Payment Integration
- [ ] Integrate with Stripe
Decide what features should be included when subscribing
Examples:
- Maximum allowed resumes and cover letters
- Maximum allowed applications
- Maximum allowed sessions

### AI Integration (Features)
- [ ] Find a free AI service to integrate with, for learning (use Outbound Port and Adapter for flexibility)
Examples:
- Generate cover letters based on the applicant's resume and job description
- Generate better headline and bio based on the applicant's position
