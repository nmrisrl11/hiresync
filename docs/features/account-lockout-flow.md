# IAM Security: Account Lockout & Brute Force Protection

## Overview
To protect user accounts from automated brute-force and credential-stuffing attacks, the Identity and Access Management (IAM) module enforces a strict lockout policy. 

Following industry standards, the system allows a maximum of **5 consecutive failed login attempts**. Once this threshold is reached, the account is temporarily locked for **15 minutes**. 

## Domain-Driven Design: The Value Object
The lockout logic is completely encapsulated within a Domain Value Object named `FailedLoginState`. 
By relying on a Value Object, the primitive data (`count` and `lockedUntil`) is hidden, and the rules (threshold limits, time additions) are inherently enforced by the domain rather than the application layer.

The Value Object is **immutable**. When a failed login occurs, it does not mutate its current state; instead, it returns a pristine, new instance of itself containing the updated count and expiration date.

## Authentication Flow

### 1. The Pre-Check (Early Rejection)
When a login request hits the `LoginUseCase`, the system checks the account's lock state **before** verifying the password hash.
* If the account is locked (the current time is before the `lockedUntil` date), the system instantly rejects the request, bypassing expensive cryptographic operations.
* If the lock has naturally expired, the `FailedLoginState` silently resets itself to `0` attempts, and the flow continues.

### 2. Password Verification: The Failure Path
If the user provides an incorrect password:
1. The `FailedLoginState` VO increments the failure count.
2. If the count reaches `5`, it calculates a `lockedUntil` date (Current Time + 15 Minutes).
3. The Use Case immediately saves this new state to the PostgreSQL database to ensure concurrent requests cannot bypass the counter.
4. An `InvalidLoginException` is thrown (or an `AccountLockedException` if the threshold was just crossed).

### 3. Password Verification: The Happy Path
If the user provides the correct password and the account is not locked:
1. The Use Case calls `resetFailedLogins()`.
2. Any previous failed attempts (e.g., 3 failed attempts prior to this successful one) are wiped clean.
3. The backend issues the JWT access and refresh tokens.

## Frontend Integration Guide

When an account is locked, the frontend must be prepared to catch a specific error response and inform the user.

**The Request:**
* **Endpoint:** `POST /api/auth/login`
* **Payload:** `{ "email": "user@example.com", "password": "WrongPassword!" }`

**The Expected Error Response:**
When the threshold is hit, the backend will return a `403 Forbidden` (or `429 Too Many Requests` depending on the exception filter mapping) with the following structure:

```json
{
    "statusCode": 403,
    "error": "AccountLockedException",
    "message": "Account is temporarily locked due to multiple failed login attempts. Please try again after 2:45:00 PM.",
    "timestamp": "2026-07-28T14:30:00.000Z"
}
```

**Frontend Action:**
* Catch the `AccountLockedException` error name.
* Display the provided `message` to the user in a toast notification or error alert so they know exactly when they can try logging in again.
* **Do not** immediately route them to a password reset screen unless they explicitly click a "Forgot Password?" link.
