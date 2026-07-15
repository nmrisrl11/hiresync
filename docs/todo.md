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

- [ ] Move email background queueing with event-driven

### Schedule Tasks

### VS Code Preview

| Platform | Shortcut |
|----------|----------|
| Windows / Linux | `Ctrl + Shift +V` |
| macOS | `Cmd + Shift +V` |