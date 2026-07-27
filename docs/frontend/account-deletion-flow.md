# Frontend Integration Guide: Account Deletion & Restoration Flow

## Overview
To comply with data privacy standards, account deletions are no longer instant. Deleting an account initiates a 14-day grace period (Soft Delete). If a user logs in during this grace period, they will be intercepted and given the option to cancel the deletion and restore their account.

This requires specific handling on the frontend across the Settings, Login, and Restoration UI views.

---

## Flow 1: Initiating the Deletion (Settings Page)

When an authenticated user chooses to delete their account from their dashboard/settings:

1. **The Request:**
   * **Endpoint:** `DELETE /api/accounts`
   * **Headers:** Requires valid Bearer Token (Access Token).
   
2. **The Response:**
   * **Success:** Returns `204 No Content`.
   
3. **Frontend Action:**
   * Display a success toast: *"Your account has been scheduled for deletion. You have 14 days to cancel this action by logging back in."*
   * Instantly log the user out on the client-side (clear local state/storage).
   * Redirect the user to the public Homepage or Login screen.

---

## Flow 2: The Login Interception (Login Page)

When a user attempts to log in, the backend will verify their password first. If the credentials are correct *but* the account is pending deletion, the backend will block the login and return a specific `403 Forbidden` response.

1. **The Request:**
   * **Endpoint:** `POST /api/auth/login`
   * **Payload:** `{ "email": "user@example.com", "password": "Password123!" }`

2. **The Expected Error Response:**
   ```json
   {
       "statusCode": 403,
       "error": "ACCOUNT_PENDING_DELETION",
       "message": "Account is scheduled for deletion on 2026-08-10T00:00:00.000Z",
       "scheduledDate": "2026-08-10T00:00:00.000Z",
       "timestamp": "2026-07-27T12:00:00.000Z"
   }
   ```

3. **Frontend Action:**
   * **DO NOT** show a standard "Invalid Credentials" error. 
   * **DO** catch the `ACCOUNT_PENDING_DELETION` error code.
   * Redirect the user to a dedicated `/restore-account` view (or show a modal).
   * **State Management:** Pass the `email`, `password`, and `scheduledDate` into the state of this new view so the user doesn't have to type their credentials again.

---

## Flow 3: Restoring the Account (Restore Page)

If the user was intercepted in Flow 2 and clicks "Yes, restore my account":

1. **The Request:**
   * **Endpoint:** `POST /api/auth/restore`
   * **Payload:** `{ "email": "user@example.com", "password": "Password123!" }`
     *(Use the credentials passed from the login state)*

2. **The Response:**
   * **Success:** Returns `200 OK`
   ```json
   {
       "message": "Account successfully restored.",
       "accessToken": "eyJhbG..."
   }
   ```
   *(The backend also attaches the HTTP-only `refresh_token` cookie automatically).*

3. **Frontend Action:**
   * Display a success toast: *"Welcome back! Your account has been fully restored."*
   * Save the `accessToken` to memory/state.
   * Redirect the user to their authenticated Dashboard.
