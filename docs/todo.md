# HireSync - Todos 

## Roadmap

### Authentication

[x] - Registration
[x] - Login
[x] - Logout
[x] - Assigning and Verifying JWT Access and Refresh Tokens
[x] - Password Hashing with bcrypt
[x] - Email Verification with nodemailer and resend
[x] - Forgot Password
[x] - Reset Password
[x] - Refresh Access Token with refresh token
[x] - Resending email verification

- To add on IAM (Identity and Access Management) module
    [x] - Update Password (Authenticated) 
    - A secure flow for logged-in users to change their password by validating their oldPassword hash before accepting a newPassword.
    [] - Updated Email Address
    - A dual-step flow that generates a new verification token and sends it to the new email address before updating the actual database record, preventing accidental account lockouts.
    [] - Account deletion
    - A compliance-driven feature (GDPR/CCPA) that permanently deletes the user's identity, invalidates all tokens, and scrubs associated account data.
    [] - Account Lockout (Brute Force Protection)
    - Tracking consecutive failed login attempts on the Account entity and temporarily locking the account (e.g., for 15 minutes) if a threshold is reached.
    [] - Multi-Factor Authentication (MFA / 2FA)
    - Implementing Time-based One-Time Passwords (TOTP) to require a secondary rotating code from apps like Google Authenticator or Authy during login.
    [] - Multi-Device Session Management
    - Upgrading the single refreshTokenHash into a separate Session entity (one-to-many relationship with Account), allowing users to see active devices and click "Log out of all other sessions."
    [] - Manual OAuth Integration
    - Building custom authorization flows for providers like Google, GitHub, or Microsoft without relying on third-party UI libraries, keeping the domain architecture strictly under your control.
    
### User

[x] - Create user
[x] - Get user profile of current authenticated user
[x] - Get users (ADMIN)
[x] - Get user by id (ADMIN)
[x] - Get user by id (PUBLIC)
[x] - Update user
[x] - Delete user

### Role

[] - Create role
[] - Get roles
[] - Get role by id
[] - Update role by id
[] - Delete role by id

### Changing of account image with S3