# OAuth 2.0 Integration & Authentication Flow

This document details the end-to-end OAuth 2.0 authentication flow implemented in the `HireSync` application. The backend strictly follows the RFC-compliant Authorization Code flow utilizing a Clean Architecture pattern, completely avoiding third-party authentication middleware (like Passport.js) in favor of a manual, fully-controlled infrastructure adapter.

## 1. Supported OAuth Providers

The application's domain and infrastructure layers currently define the following supported providers:
*   **Google:** Fully implemented and active.
*   **GitHub:** Pre-defined in the `ManualOAuthAdapter` (awaiting environment variables).
*   **Microsoft (Entra ID):** Pre-defined in the `ManualOAuthAdapter` (awaiting environment variables).

---

## 2. The Authentication Flow (Server-Side)

### Phase 1: Initiation & CSRF Protection
The flow begins when the frontend requests an authorization URL for a specific provider.

**Endpoint:** `GET /api/v1/auth/oauth/:provider/url`

1.  **State Generation:** The `GetOAuthAuthUrlUseCase` utilizes the `StateGeneratorPort` (Node Crypto) to generate a secure, random string known as the `state`.
2.  **Purpose of State:** This token mitigates Cross-Site Request Forgery (CSRF) attacks. It ensures that the callback request returning from the OAuth provider genuinely originated from our application.
3.  **URL Construction:** The infrastructure adapter constructs the specific provider's login URL, appending the `client_id`, `redirect_uri`, requested scopes (`openid`, `email`, `profile`), and the `state`.
4.  **Response:** The URL and state are returned to the client to execute the redirect.

### Phase 2: Google Cloud Configuration & Redirects
For Google OAuth to succeed, the Google Cloud Console must be precisely configured.

*   **Authorized JavaScript Origins:** Must match the frontend domain (e.g., `http://localhost:3000` for development).
*   **Authorized Redirect URIs:** This URL dictates where Google sends the user *after* they grant consent. Currently, this must exactly match the NestJS backend endpoint:
    `http://localhost:3000/api/v1/auth/oauth/google/callback`
*   **Test Users:** While the Google Cloud app is in "Testing" mode, any external Google accounts attempting to log in must be explicitly added to the "Test Users" list in the OAuth Consent Screen dashboard, otherwise Google will return a `403 Access Denied` error (unless the account belongs to the project creator/admin).

### Phase 3: The Callback & Token Exchange
Once the user grants permission, Google redirects them to the backend callback URI.

**Endpoint:** `GET /api/v1/auth/oauth/:provider/callback`

1.  **Capture Code:** The controller intercepts the redirect, extracting the authorization `code` and the `state` query parameters.
2.  **Token Exchange:** The `ManualOAuthAdapter` executes a secure server-to-server HTTP `POST` request to the provider's token endpoint, exchanging the short-lived `code` (and the `client_secret`) for an `access_token`.
3.  **Profile Extraction:** Using the `access_token`, the adapter fetches the user's profile information (Subject ID, Email, Name, Avatar) and normalizes it into a standard `OAuthProfileDto`.

### Phase 4: Identity Resolution (New vs. Existing Accounts)
The `OAuthCallbackLoginUseCase` processes the profile data to seamlessly handle account creation and auto-linking.

1.  **Direct Match:** It first checks if the provider's unique ID (`providerAccountId`) is already linked to a user via the `OAuthAccount` entity.
2.  **Auto-Linking (Existing User):** If no direct match is found, it queries the database by the provider's `email`. If a user exists (e.g., they previously registered with a password), it implicitly trusts the OAuth provider's email verification and **auto-links** the new social identity to the existing `User` aggregate.
3.  **OAuth-First Registration (New User):** If the email is completely unknown, the system creates a brand new user:
    *   Assigns the default `APPLICANT` role.
    *   Marks `isVerified` as `true` automatically.
    *   Leaves the `passwordHash` as `null`. (Guards are in place across the application to prevent OAuth-only users from changing passwords or disabling MFA without setting up credentials first).

### Phase 5: Security Checks & Session Issuance
Before finalizing the login:
1.  **Pending Deletion:** The system ensures the account is not scheduled for deletion.
2.  **MFA Interception:** If the user has Multi-Factor Authentication enabled, the flow pauses. An `mfaChallengeToken` is returned (`mfaRequired: true`), and the frontend must redirect the user to an MFA verification screen.
3.  **Session Creation:** If no MFA is required, a secure `Session` is generated. 
4.  **Cookies:** The `refresh_token` is attached to the response as an `HttpOnly`, `secure`, `sameSite: "lax"` cookie. The JWT `access_token` and user data are returned in the JSON payload.

---

## 3. Frontend Integration Options (Next.js)

Currently, the backend handles the callback directly, resulting in raw JSON being displayed in the browser. To fully integrate this with the Next.js frontend, one of the following architectural patterns must be implemented.

### Option A: The Backend Redirect Pattern (Recommended for ease of use)
The callback remains on the backend, but the response is altered to redirect the user back to the frontend SPA.

1.  **Update Authorized Redirect URI:** Keep it pointed at NestJS (`/api/v1/auth/oauth/google/callback`).
2.  **Backend Change:** Instead of returning `HttpStatus.OK` with JSON, the `OAuthController` issues an `HttpCode(302)` redirect.
3.  **Handoff:** The backend sets the HttpOnly refresh token cookie, then redirects the browser to a specific Next.js page, passing the short-lived access token in the URL or via a secure temporary cookie.
    *   *Example:* `res.redirect('http://localhost:3000/auth/success?token=eyJhbG...')`
4.  **Frontend Action:** A Next.js client component captures the token from the URL, stores it in memory (or a global state manager), and pushes the user to the dashboard.

### Option B: The Frontend Callback Pattern (Standard SPA approach)
The backend acts purely as an API, and the Next.js frontend handles the browser redirects.

1.  **Update Authorized Redirect URI:** Point it to a Next.js route (e.g., `http://localhost:3000/auth/oauth/callback`).
2.  **Frontend Action:** Next.js receives the redirect from Google, extracts the `code` and `state` from the URL parameters, and immediately makes an invisible AJAX `POST` request to the NestJS backend.
3.  **Backend Change:** The NestJS callback endpoint is changed from a `GET` to a `POST` request. It receives the code in the request body, executes the exchange, sets the HttpOnly cookie, and returns the JSON directly to the Next.js AJAX call.
4.  **Handoff:** Next.js receives the JSON response, updates the UI state, and routes the user seamlessly.
