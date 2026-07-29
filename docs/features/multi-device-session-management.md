# IAM Feature: Multi-Device Session Management

## Overview
The Identity and Access Management (IAM) module utilizes a Multi-Device Session Management architecture. Instead of storing a single refresh token per user, the system tracks individual logins using a dedicated `Session` Domain Entity. 

This allows users to be logged in concurrently across multiple devices (e.g., mobile phone, desktop browser, tablet) without overriding each other's authentication state. It also grants users fine-grained control to view their active devices and remotely log out (revoke) specific sessions.

## The Two-Tier Token Strategy
The system balances high API performance with strict security by combining stateless Access Tokens with stateful Refresh Tokens.

1. **Access Tokens (Stateless & Fast):** 
   - Lifespan: 15 minutes.
   - Mechanism: Validated strictly via cryptographic signature by the NestJS Guard. It does *not* query the database. This guarantees ultra-fast authorization for every API request.
   - Caveat: If a session is revoked, the Access Token remains valid until its 15-minute natural expiration.

2. **Refresh Tokens (Stateful & Secure):**
   - Lifespan: 7 days.
   - Mechanism: Stored as a secure, `httpOnly` cookie. When the Access Token expires, the frontend calls `/auth/refresh`. This endpoint *does* check the database. If the session was marked as revoked, the refresh is denied, permanently terminating the session.

## Core Business Flows

### 1. Login & Device Registration
When a user logs in via `/api/auth/login` (or verifies their email / restores their account):
1. The Controller extracts device metadata (`User-Agent` and `IP Address`) directly from the request headers.
2. The Use Case generates a unique `SessionId`.
3. The `sessionId` is embedded directly into the JWT Payload (alongside `sub`, `email`, and `role`).
4. A new `Session` entity is created and attached to the `User` aggregate in the database, storing the hashed refresh token and device metadata.

### 2. Token Refresh & Rotation
When the frontend hits `/api/auth/refresh`:
1. The system decodes the refresh token and extracts the `sessionId`.
2. It queries the database to ensure this specific session is not expired and `isRevoked` is false.
3. **Security Check (Token Reuse Detection):** It compares the provided token against the hashed token in the database. 
   - If they **match**: A new set of tokens is generated, the session's `lastActiveAt` timestamp is updated, and the new refresh token hash is saved (Token Rotation).
   - If they **do not match**: This indicates a stolen token replay attack. An attacker is attempting to use an old, already-rotated refresh token. The system instantly revokes **all** active sessions for that user to secure the account.

### 3. Session Revocation (Logout)
When a user explicitly logs out:
1. The backend extracts the `sessionId` from their current Access Token payload.
2. The specific session in the database is flagged as `isRevoked = true`.
3. The `httpOnly` refresh cookie is cleared from the browser.
4. Other active devices (e.g., their mobile app) remain logged in.

### 4. Account Security Interventions
Certain actions demand immediate security sweeps across all devices:
- **Change Password / Reset Password:** If a user updates their password, the Use Case triggers `user.revokeAllOtherSessions(currentSessionId)` (or `revokeAllSessions()` for a forgotten password). This guarantees that if an attacker had access to the account on another device, their refresh token is instantly invalidated.

## Exposing Device Management to the User
The `AccountController` exposes three endpoints for front-end integration, allowing users to manage their own security:

* `GET /api/accounts/sessions`: Returns a list of all active sessions, including device metadata, last active timestamps, and a boolean flagging their `isCurrentDevice`.
* `DELETE /api/accounts/sessions/:id`: Revokes a specific targeted device.
* `DELETE /api/accounts/sessions/others`: Revokes all devices except the one currently making the request.

## Automated Database Cleanup
To prevent database bloat from indefinitely storing expired sessions, a background scheduled task (`CleanExpiredSessionsTask`) runs daily at 2:00 AM to hard-delete any session where `expiresAt` is in the past.
