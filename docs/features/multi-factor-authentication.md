# Feature: Multi-Factor Authentication (MFA / 2FA)

## Overview
The Identity and Access Management (IAM) module supports Time-based One-Time Password (TOTP) Multi-Factor Authentication (MFA). It allows users to secure their accounts using authenticator applications (such as Google Authenticator, Authy, or 1Password) and provides fallback recovery access through one-time backup codes.

To maintain adherence to Domain-Driven Design (DDD) and Clean Architecture, MFA state is encapsulated within the `MfaConfiguration` Value Object embedded inside the `Account` entity. The Presentation and Application layers orchestrate the challenge-response login flow without leaking framework-specific dependencies.

---

## Architecture & Domain Model

### 1. `MfaConfiguration` Value Object
The `MfaConfiguration` Value Object maintains the integrity of the account's MFA security posture:
* `isEnabled` (`boolean`): Flags whether MFA is actively enforced on login.
* `secret` (`string | null`): Stores the live Base32 TOTP secret.
* `pendingSecret` (`string | null`): Holds a temporary Base32 secret generated during setup. It is never promoted to `secret` until the user successfully verifies their first 6-digit TOTP token.
* `backupCodes` (`string[]`): Stores an array of bcrypt/argon2 hashed recovery strings directly in PostgreSQL (`TEXT[]`).

### 2. Domain Entities & Invariants
* **`Account` Entity:** Manages MFA state transitions (`initiateMfaSetup`, `enableMfa`, `disableMfa`, `consumeMfaBackupCode`).
* **`User` Aggregate Root:** Exposes MFA domain operations and emits lifecycle Domain Events (`UserMfaEnabledDomainEvent`, `UserMfaDisabledDomainEvent`).
* **Exception Boundaries:** Domain exceptions (`InvalidMfaConfigurationException`, `InvalidMfaTokenException`, `MfaNotEnabledException`) bubble up naturally through the Application layer to be unified by the `IamExceptionFilter`.

---

## Authentication & Login Interception Flow

When MFA is enabled on an account, the standard login flow is intercepted after email verification and password validation are completed.

```text
[Frontend Client]
       │
       ├─► 1. POST /auth/login (email, password)
       │         │
       │         ▼
       │     [LoginUseCase] ──► Password Valid? ──► isMfaEnabled === true?
       │                                                   │
       │◄── 2. 200 OK { mfaRequired: true,                 │ (Yes)
               mfaChallengeToken: "eyJ..." } ◄─────────────┘
       │
       ├─► 3. POST /auth/login/mfa (mfaChallengeToken, code: "123456")
       │         │
       │         ▼
       │     [MfaLoginUseCase] ──► Verify Challenge Token (5m TTL)
       │                               │
       │                               ├─► Verify TOTP Code? (Success)
       │                               │         OR
       │                               └─► Verify & Consume Backup Code?
       │                                         │
       │◄── 4. 200 OK + Set-Cookie (refresh_token) ◄───┘
               { accessToken: "eyJ...", user: { ... } }
```

### 1. Step 1: Initial Credentials Verification (`POST /auth/login`)
1. The client submits credentials (`email`, `password`) to `AuthController.login()`.
2. `LoginUseCase` checks account lockouts, verification status, and compares the password hash.
3. If `user.isMfaEnabled()` evaluates to `true`:
   * No `Session` record is created.
   * No `refresh_token` HTTP-only cookie is attached.
   * A short-lived (5-minute TTL) JWT challenge token is signed containing `{ sub: userId, email, type: "MFA_CHALLENGE" }`.
   * Returns `{ mfaRequired: true, mfaChallengeToken }`.

### 2. Step 2: MFA Challenge Verification (`POST /auth/login/mfa`)
1. The client prompts the user for their 6-digit authenticator code or backup recovery code.
2. The client submits `{ mfaChallengeToken, code }` to `AuthController.loginMfa()`.
3. `MfaLoginUseCase` executes:
   * Verifies the `mfaChallengeToken` signature and ensures `payload.type === "MFA_CHALLENGE"`. If expired or invalid, throws an `InvalidMfaChallengeException` (HTTP 401).
   * Retrieves the user's live Base32 `secret` and checks `speakeasy.totp.verify()` with a 30-second window skew.
   * **Backup Code Fallback:** If TOTP verification fails, it iterates through `mfaBackupCodes`, comparing the plaintext input against the hashed codes using `HashServicePort`.
   * **Backup Code Consumption:** If a matching backup code is found, `user.consumeMfaBackupCode(hashedCode)` is called immediately to remove the consumed hash from the array, preventing replay attacks.
4. Upon successful verification, a Multi-Device `Session` record is generated, the `refresh_token` HTTP-only cookie is attached, and the `accessToken` is returned.

---

## MFA Lifecycle Flows (Enable / Disable)

### 1. MFA Enrollment Setup (`POST /accounts/mfa/setup`)
* **Auth Requirement:** Authenticated User (`@CurrentUser()`).
* **Workflow:**
  1. `InitiateMfaSetupUseCase` calls `MfaServicePort.generateSecret(email)`.
  2. Generates a Base32 secret and a Base64 PNG QR Code data URI (`qrCodeUrl`).
  3. Saves the Base32 string to `account.mfaPendingSecret` without enabling MFA.
  4. Returns `{ secret, qrCodeUrl }` to the frontend.

### 2. MFA Enrollment Activation (`POST /accounts/mfa/enable`)
* **Auth Requirement:** Authenticated User (`@CurrentUser()`).
* **Workflow:**
  1. The user scans the QR code and submits their first 6-digit TOTP token (`code`) to `EnableMfaUseCase`.
  2. Verifies `code` against `account.mfaPendingSecret`.
  3. Generates **10 secure backup recovery codes** (e.g., `4A8F9C2E`), hashes them via `HashServicePort`, and calls `user.enableMfa(hashedBackupCodes)`.
  4. Promotes `mfaPendingSecret` to `mfaSecret`, sets `isMfaEnabled = true`, and emits `UserMfaEnabledDomainEvent`.
  5. Returns `{ backupCodes: string[] }` in **plaintext once** so the user can download or copy them.

### 3. Disabling MFA (`DELETE /accounts/mfa/disable`)
* **Auth Requirement:** Authenticated User (`@CurrentUser()`).
* **Workflow:**
  1. The user submits `{ currentPassword }` to `DisableMfaUseCase`.
  2. Validates `currentPassword` against `account.passwordHash` via `HashServicePort` to prevent unauthorized session takeover.
  3. Calls `user.disableMfa()`, clearing `mfaSecret`, `mfaPendingSecret`, and `mfaBackupCodes`, and setting `isMfaEnabled = false`.
  4. Emits `UserMfaDisabledDomainEvent` and returns HTTP `204 No Content`.

---

## Frontend Integration Guide

### 1. Handling Login Responses
When implementing the login form, the frontend must inspect the boolean `mfaRequired` property before routing the user:

```typescript
interface LoginResponse {
  mfaRequired: boolean;
  mfaChallengeToken?: string;
  accessToken?: string;
  user?: UserProfile;
}

async function handleLogin(email: string, password: string) {
  const response: LoginResponse = await api.post("/auth/login", { email, password });

  if (response.mfaRequired && response.mfaChallengeToken) {
    //! 1. Store the temporary challenge token in memory/state
    setMfaChallengeToken(response.mfaChallengeToken);
    //! 2. Redirect or display the OTP verification modal
    showMfaVerificationStep();
    return;
  }

  //! Standard login complete
  applyAccessToken(response.accessToken!);
  redirectToDashboard();
}
```

### 2. Submitting the MFA Challenge
```typescript
async function handleMfaSubmission(code: string, challengeToken: string) {
  try {
    const response = await api.post("/auth/login/mfa", {
      mfaChallengeToken: challengeToken,
      code: code.trim(), //! Accepts either 6-digit TOTP or backup code
    });

    applyAccessToken(response.accessToken);
    redirectToDashboard();
  } catch (error) {
    //! Handles 401 Unauthorized (invalid code or expired challenge token)
    displayError("Invalid verification code. Please try again.");
  }
}
```

### 3. MFA Setup & Backup Code Display
When enabling MFA in the user account settings:
1. Call `POST /accounts/mfa/setup` and render the returned `qrCodeUrl` inside an `<img src={qrCodeUrl} />` tag.
2. Provide a text input for the user to submit their verification code to `POST /accounts/mfa/enable`.
3. When `POST /accounts/mfa/enable` succeeds, **immediately display the returned `backupCodes` array** in a modal with a "Download as TXT" or "Copy to Clipboard" button.
4. Warn the user that backup codes cannot be viewed again once the modal is closed.
