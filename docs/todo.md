# HireSync - Todos

## Roadmap

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

#### To add on IAM (Identity and Access Management)

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

### User

- [x] Create User
- [x] Get Current Authenticated User
- [x] Get Users (Admin)
- [x] Get User by ID (Admin)
- [x] Get User by ID (Public)
- [x] Update User
- [x] Delete User

### Role

- [/] Create Role
- [x] Get Roles
- [/] Get Role by ID
- [/] Update Role
- [/] Delete Role

### Storage

- [x] Upload and set account avatar with Cloudinary
- [x] Removing of account avatar

### Event Driven

- [x] Move email background queueing with event-driven

### Employers
- [x] Create company profile
- [x] Edit company profile
- [ ] Upload/Remove company profile logo
- [x] Get/View company profile
- [x] Create job listing
- [x] Edit job listing
- [x] Delete/Close job listing
- [x] Get/View job listing
    #### Email Notifications
    - [x] Created company profile
    - [ ] Updated company profile
    - [x] Created job listing
    - [ ] Updated job listing
    - [ ] Closed job listing
    - [ ] Expired job listing - with Task job using CRON?

### Applicants
- [ ] Browse available jobs
- [ ] View job details
- [ ] Search jobs
- [ ] Filter jobs

### Applications
- Applicants can:
    - [ ] Apply for jobs
    - [ ] Upload resumes
    - [ ] Upload cover letters
    - [ ] View submitted applications
- Employers can:
    - [ ] View applicants
    - [ ] Review uploaded resumes

### File Uploading
- [ ] Resume in PDF
- [ ] Cover letter in PDF
- [ ] Company logo?

### Email Notifications
- [x] Welcome Email
- [x] Farewell (Deleted Account) Email
- [x] Send and Resend Verification Email
- [x] Forgot and Change Password
- [x] Request and Confirmation of Changing Email
- [ ] Job Application Confirmation
- [ ] Employer Notification
- [ ] Job Expiration Reminder

### Schedule Tasks
- [ ] Remove expired tokens
