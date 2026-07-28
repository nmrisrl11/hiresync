# Authentication & Authorization Guide

## Overview

Authentication and authorization are often confused, but they solve different problems.

- **Authentication** → *Who are you?*
- **Authorization** → *What are you allowed to access?*

Example:

- Logging in with your email and password → **Authentication**
- Allowing an app to read your Google Calendar → **Authorization**

---

# JWT (JSON Web Token)

## What is JWT?

JWT (JSON Web Token) is a compact, URL-safe token format commonly used for **stateless authentication** between a client and a server.

> **Important:** JWT is **not an authentication method**. It is only a **token format**.

A JWT contains information (called **claims**) about the authenticated user and is digitally signed by the server.

---

## JWT Authentication Flow

```text
+--------+
| Client |
+--------+
     |
     | Login (email/password)
     v
+-----------+
| API Server|
+-----------+
     |
     | Verify credentials
     |
     | Generate JWT
     v
+--------+
| Client |
+--------+
     |
     | Authorization: Bearer <JWT>
     v
+-----------+
| API Server|
+-----------+
     |
     | Verify JWT
     |
     | Allow access
```

---

## JWT Structure

A JWT consists of three parts:

```
HEADER.PAYLOAD.SIGNATURE
```

Example:

```
eyJhbGciOiJIUzI1NiIs...
```

### Header

Contains information about the signing algorithm.

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

---

### Payload

Contains claims about the user.

```json
{
  "sub": "123",
  "email": "john@example.com",
  "role": "admin",
  "exp": 1712345678
}
```

Common claims:

| Claim | Description |
|--------|-------------|
| sub | User ID |
| email | User email |
| role | User role |
| exp | Expiration time |
| iat | Issued at |
| iss | Issuer |

---

### Signature

Used to verify the token has not been modified.

```
HMACSHA256(
    base64UrlEncode(header) +
    "." +
    base64UrlEncode(payload),
    SECRET_KEY
)
```

---

## JWT Advantages

- Stateless authentication
- No server-side session storage
- Fast to verify
- Easy to scale
- Widely supported

---

## JWT Disadvantages

- Difficult to revoke before expiration
- Larger than session IDs
- Payload is readable (not encrypted)
- Secret/private key must be protected

---

# OAuth 2.0

## What is OAuth?

OAuth 2.0 is an **authorization framework**.

It allows an application to access another application's resources **without knowing the user's password**.

> OAuth is **not authentication**.

---

## Real-Life Example

Imagine you have:

- Google Photos
- A photo editing app

Without OAuth:

```
Photo App
    |
    | Google Password
    v
Google
```

The photo app knows your password.

❌ Unsafe

---

With OAuth:

```
Photo App
      |
      | Redirect
      v
Google Login
      |
      | User approves
      v
Google
      |
      | Access Token
      v
Photo App
```

The photo app never sees your password.

---

## OAuth Roles

### Resource Owner

The user.

Example:

```
You
```

---

### Client

The application requesting access.

Example:

```
Canva
Notion
Slack
```

---

### Authorization Server

Authenticates the user and issues tokens.

Example:

```
Google
GitHub
Microsoft
```

---

### Resource Server

Contains the protected data.

Example:

```
Google Drive API
GitHub API
Microsoft Graph API
```

---

## OAuth Authorization Code Flow

```text
User
 |
 | Login
 v
Application
 |
 | Redirect
 v
Authorization Server
 |
 | User logs in
 | User approves permissions
 |
 | Authorization Code
 v
Application
 |
 | Exchange code
 v
Authorization Server
 |
 | Access Token
 v
Application
 |
 | API Request
 v
Resource Server
```

---

## OAuth Tokens

### Access Token

Used to call APIs.

```
Authorization: Bearer ACCESS_TOKEN
```

Usually expires within minutes or hours.

---

### Refresh Token

Used to obtain a new Access Token without asking the user to log in again.

---

## Common OAuth Flows

### Authorization Code + PKCE

Recommended for:

- Web applications
- Mobile applications
- SPA (React, Vue, Angular)

---

### Client Credentials

Used for:

- Server-to-server communication
- No user involved

Example:

```
Backend A
      |
      | Access Token
      v
Backend B
```

---

### Refresh Token Flow

Used when the Access Token expires.

---

# OpenID Connect (OIDC)

## What is OpenID Connect?

OpenID Connect (OIDC) is an authentication layer built on top of OAuth 2.0.

OAuth answers:

> Can this application access your resources?

OIDC answers:

> Who is the user?

---

## Login with Google

When you click:

```
Continue with Google
```

The flow is actually:

```
OpenID Connect
        +
OAuth 2.0
```

---

## OIDC Returns

Instead of only:

```
Access Token
```

OIDC also returns:

```
ID Token (JWT)
```

The ID Token contains the user's identity.

Example:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "picture": "...",
  "sub": "123456"
}
```

---

# JWT vs OAuth vs OpenID Connect

| Feature | JWT | OAuth 2.0 | OpenID Connect |
|----------|-----|-----------|----------------|
| Purpose | Token Format | Authorization | Authentication |
| Used for Login | Sometimes | No | Yes |
| Used for API Access | Yes | Yes | Yes |
| Third-Party Login | No | Partially | Yes |
| Issues Tokens | No | Yes | Yes |
| Contains User Identity | Yes | Not necessarily | Yes |

---

# Backend Development Scenarios

## Scenario 1 — Traditional Login

```
React App
      |
      | Email + Password
      v
Backend API
      |
      | Verify credentials
      |
      | Generate JWT
      v
React App
      |
      | Bearer JWT
      v
Backend API
```

Technology used:

- Authentication ✔
- JWT ✔
- OAuth ✖

---

## Scenario 2 — Login with Google

```
React App
      |
      | Continue with Google
      v
Google
      |
      | Authenticate user
      |
      | ID Token + Access Token
      v
Backend API
      |
      | Validate Google Token
      |
      | Create local user
      |
      | Generate your own JWT
      v
React App
```

Technology used:

- OAuth ✔
- OpenID Connect ✔
- JWT ✔

Notice that many applications still create **their own JWT** after a successful Google login. The Google tokens establish the user's identity, while the application's JWT manages authentication for its own backend APIs.

---

# Authentication vs Authorization

| Authentication | Authorization |
|----------------|---------------|
| Who are you? | What can you access? |
| Login | Permissions |
| Verify identity | Verify access rights |
| Email + Password | Roles & Permissions |
| Login with Google | Allow Google Drive access |

---

# Summary

## JWT

- Token format
- Commonly used for stateless authentication
- Contains claims about a user
- Sent as a Bearer Token

---

## OAuth 2.0

- Authorization framework
- Allows third-party applications to access resources
- Never shares the user's password
- Uses Access Tokens and Refresh Tokens

---

## OpenID Connect

- Authentication protocol built on OAuth 2.0
- Enables "Login with Google", "Login with Microsoft", etc.
- Returns an ID Token containing the authenticated user's identity

---

# Quick Memory Guide

| Think of... | Use... |
|--------------|---------|
| My own login system | JWT |
| Login with Google | OpenID Connect + OAuth |
| Access another service's API | OAuth |
| Stateless API authentication | JWT |
| Third-party authorization | OAuth |
| Third-party authentication | OpenID Connect |
