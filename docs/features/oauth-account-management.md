# OAuth Account Linking & Management

This document details the flows for retrieving, linking, and unlinking OAuth providers for an existing user account within the Clean Architecture structure. It explains the domain guards, the intent-based callback interception, and the persistence requirements.

## 1. Fetching Connected Providers

To display which social accounts a user has linked (e.g., for a settings page), the backend provides a protected endpoint that queries the `User` aggregate.

*   **Endpoint:** `GET /api/accounts/oauth`
*   **Authentication:** Bearer Token (JWT) Required
*   **Application Logic:** The `GetConnectedOAuthProvidersUseCase` retrieves the user by ID and maps over their internal `oauthAccounts` array to return an array of provider types.

**Success Response:**
```json
{
  "message": "Connected providers retrieved successfully.",
  "data": ["GOOGLE", "GITHUB"]
}
```

---

## 2. Linking an OAuth Provider (Authenticated Flow)

When a user is already logged in with credentials (or another social provider) and wishes to connect a new OAuth provider, the application uses an **Intent Cookie Pattern** to differentiate a "link" action from a standard "login" action.

### Phase 1: Requesting the Link URL
*   **Endpoint:** `GET /api/accounts/oauth/:provider/link-url`
*   **Authentication:** Bearer Token (JWT) Required

**How it works:**
1.  The controller generates the standard OAuth authorization URL (with state).
2.  Before returning the URL, the backend sets a secure, short-lived cookie named `oauth_link_intent`.
3.  **Cookie Configuration:**
    *   `Value`: The current authenticated user's ID (`userPayload.sub`).
    *   `MaxAge`: 5 minutes.
    *   `Path`: `/api/auth/oauth` (Strictly scoped to the OAuth controller path).

### Phase 2: Callback Interception
*   **Endpoint:** `GET /api/auth/oauth/:provider/callback`

**How it works:**
1.  When Google redirects back, the `OAuthController` checks for the `oauth_link_intent` cookie.
2.  If the cookie exists, the backend *knows* this is a linking operation.
3.  The controller immediately clears the cookie to prevent reuse.
4.  It dispatches the `LinkOAuthProviderCommand`, exchanging the code for a profile.
5.  **Domain Guard:** The use case checks if the retrieved `providerAccountId` is already linked to a different user. If it is, a `ConflictException` is thrown.
6.  The new `OAuthAccount` entity is created and linked via the `user.linkOAuthAccount()` domain method.

---

## 3. Unlinking an OAuth Provider

Users can revoke an OAuth provider's access and remove it from their account.

*   **Endpoint:** `DELETE /api/accounts/oauth/:provider`
*   **Authentication:** Bearer Token (JWT) Required

### Domain Guards & Business Logic
The `User` aggregate enforces a strict rule in its `unlinkOAuthProvider` method: **A user cannot remove their last method of authentication.**

If a user tries to unlink "Google", the entity checks:
1.  Does this user have a password set?
2.  Are there any *other* OAuth providers linked?
If both are false, the domain throws an error: `"Cannot unlink the only authentication method on this account."`

### Persistence Handling (Prisma)
Because Prisma's `upsert` only handles creating and updating array relations, the repository's `save` method manually tracks unlinked accounts. It extracts the current IDs from the Domain Entity and uses a `deleteMany: { id: { notIn: currentOAuthAccountIds } }` instruction to explicitly wipe the detached provider from the database.

---

## 4. Future Frontend Handoff Considerations

Currently, the linking flow relies on a backend-managed redirect and an HttpOnly intent cookie. When transitioning to a Next.js App Router (Frontend Callback Pattern), the following links and strategies must be updated:

1.  **Redirect URI Update:** 
    The `GOOGLE_REDIRECT_URI` environment variable must be updated from the NestJS backend to the Next.js frontend (e.g., `http://localhost:3000/settings/oauth/callback`).
2.  **Handling the Link Intent:**
    Instead of relying on the backend `res.cookie` to store the linking intent, the frontend will manage this state. 
    *   *Option A:* Next.js stores a `link_intent=true` flag in `sessionStorage` before redirecting to Google. When Google redirects back to Next.js, the frontend reads the flag and makes a `POST` request to a dedicated backend endpoint (e.g., `POST /api/accounts/oauth/:provider/link`) passing the code, rather than hitting the unified login callback.
3.  **UI State Updates:**
    Upon a successful link or unlink `DELETE` request, the frontend must mutate its global `User` state or re-fetch the `/api/accounts/profile` endpoint to instantly update the list of connected providers in the settings view.
