# OAuth: Setting an Initial Password

This document outlines the context, API requirements, and frontend handling strategies for allowing users who registered via an OAuth provider (Social Login) to set an initial password for their account.

## 1. Context & Business Logic

When a user registers or logs in exclusively via an OAuth provider (e.g., Google), the backend creates their account without a password (`passwordHash` is `null`). 

Because they do not have a password, they are strictly blocked from using the standard `ChangePasswordUseCase` (which requires verifying a `currentPassword`). They are also blocked from sensitive account actions that require password confirmation, such as disabling Multi-Factor Authentication (MFA) or deleting their account.

To resolve this, the backend provides a dedicated endpoint to set an initial password, bridging their social account into a fully featured credentials-backed account.

---

## 2. The Check Point: The `hasPassword` Flag

To prevent unnecessary API calls and allow the frontend to proactively adjust the UI, the backend exposes a `hasPassword` boolean flag on the User object payload.

Whenever the frontend fetches the user session or profile (e.g., on login or via a `/me` endpoint), the payload will indicate the password state:

```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "role": "APPLICANT",
    "hasPassword": false 
  }
}
```

The frontend should store this flag in its global state (e.g., React Context, Zustand, or Redux) alongside the user's profile data.

---

## 3. Frontend Handling Strategies (Next.js)

The frontend should use the `hasPassword` flag to implement progressive enhancement across the application. Here are the required UX patterns to implement:

### A. The Settings View Swap (Required)
When the user navigates to the Security Settings page (`/settings/security`), the frontend must conditionally render the correct form based on the flag.

```tsx
// Example React Component Logic
export function SecuritySettings() {
  const { user } = useAuth(); // Retrieve from global state

  return (
    <section>
      <h2>Password Management</h2>
      {user.hasPassword ? (
        <ChangePasswordForm/> // Requires currentPassword + newPassword
      ) : (
        <SetInitialPasswordForm/> // Requires ONLY newPassword
      )}
    </section>
  );
}
```

### B. Action-Gated Interceptors (Required)
Certain backend endpoints (like disabling MFA) require a password. If an OAuth-only user attempts these actions, the frontend must intercept the click and prompt them to set a password first.

```tsx
// Example Interceptor Logic
const handleEnableMfaClick = () => {
  if (!user.hasPassword) {
    openModal(<SetInitialPasswordPrompt/>);
    return;
  }
  // Proceed to MFA setup flow
};
```

### C. The Dashboard Nudge (Optional / Recommended)
To encourage account security, the frontend can display a dismissible alert or banner on the main dashboard for OAuth-only users.
*   **Condition:** `if (isLoggedIn && !user.hasPassword)`
*   **Copy:** *"You logged in via Google. Add a password to your account as a secure backup login method."*
*   **Action:** Button routing to `/settings/security`.

---

## 4. API Reference

Use this endpoint when submitting the `<SetInitialPasswordForm />`.

### Set Initial Password
Sets a password for an account that does not currently have one. 

*   **Endpoint:** `POST /api/v1/account/password/initial`
*   **Authentication:** Bearer Token (JWT) required.
*   **Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "newPassword": "SecurePassword123!" // Must be at least 8 characters
}
```

**Success Response (200 OK):**
```json
{
  "message": "Initial password successfully set. You can now log in using credentials."
}
```

**Error Responses:**
*   `400 Bad Request`: "This account already has a password set. Please use the change password feature instead." (Triggered if `hasPassword` is already true).
*   `400 Bad Request`: Validation failure (e.g., password too short).
*   `401 Unauthorized`: Missing or invalid JWT.
