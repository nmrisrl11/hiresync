# System Audit Logging

The System Audit Logging feature provides a centralized, automated, and decoupled mechanism to track "who did what, and when" across the HireSync platform. It captures business-critical operations for security, compliance, and dispute resolution without polluting the core domain logic.

## 1. Architectural Overview

The audit logging mechanism leverages **Hexagonal Architecture**, **Event-Driven Architecture (EDA)**, and Node.js **AsyncLocalStorage**. 

Instead of manually injecting logging commands into every application use case, the system relies on domain and integration events. When a use case completes an action (e.g., updating a job application status or changing a password), it emits an event. A global listener asynchronously intercepts this event, enriches it with HTTP context, sanitizes the data, and persists it to the database.

### Key Benefits:
- **Zero Domain Pollution:** The Domain and Application layers are completely unaware of the audit log's existence.
- **Automatic HTTP Context:** IP addresses and User Agents are captured magically via `AsyncLocalStorage` without needing to be passed down through controller arguments.
- **Secure by Default:** A built-in redaction mechanism ensures sensitive data (passwords, tokens) never touches the audit log table.

---

## 2. The Execution Flow

The audit logging process follows a strict, multi-step flow:

### Step 1: HTTP Context Capture (Middleware)
When an HTTP request enters the NestJS application, the `AuditContextMiddleware` intercepts it. It extracts the `ipAddress` (handling proxied IPs) and `userAgent`. It then wraps the entire downward execution pipeline in an `AsyncLocalStorage` context.

### Step 2: Business Logic & Event Emission
The request reaches the Controller and is passed to a Use Case. The Use Case executes the core business logic (e.g., `JobApplication.updateStatus()`). The aggregate records a `DomainEvent`. At the end of the Use Case, the `DomainEventPublisherPort` emits the event across the system.

### Step 3: Global Event Interception
The `SystemModule` contains a `GlobalAuditLogListener`[cite: 40]. This listener uses NestJS's `EventEmitter2.onAny()` method to catch *every* event that passes through the system[cite: 40]. It immediately filters out anything that is not an instance of `DomainEvent` or `IntegrationEvent`[cite: 40].

### Step 4: Payload Serialization & Redaction
Before the payload is saved, it is serialized and passed through a `redactSensitiveData` function[cite: 40]. This recursively scans the event payload for a strict blocklist of `SENSITIVE_KEYS` (e.g., `password`, `token`, `mfaSecret`, `backupCodes`) and replaces their values with `[REDACTED]`[cite: 40].

### Step 5: Actor Extraction
The listener dynamically determines *who* performed the action by scanning the sanitized payload for known identity keys (`userId`, `accountId`, `employerId`, `applicantId`)[cite: 40].

### Step 6: Context Enrichment & Persistence
The listener pulls the `ipAddress` and `userAgent` from the `AsyncLocalStorage` context (`auditContextStorage.getStore()`) and appends them to a `_meta` object inside the payload[cite: 40]. Finally, it saves the structured `AuditLog` entity to the database via the `AuditLogRepository`[cite: 40]. This is done asynchronously as a "fire-and-forget" operation, so any database latency does not delay the user's HTTP response.

---

## 3. Handling Background Tasks (Cron & Queues)

Because `AsyncLocalStorage` relies on the HTTP request lifecycle, background contexts behave differently:
- **Queues (BullMQ):** When a job is pushed to Redis and processed by a worker, the original HTTP context is lost.
- **Scheduled Tasks (Cron):** System-triggered events (like `ExpireJobListingsTask`) have no incoming HTTP request.

**Handling:** The `GlobalAuditLogListener` handles this gracefully. If `auditContextStorage.getStore()` returns `undefined`, it safely assigns `null` to the `ipAddress` and `userAgent` fields in the `_meta` block, ensuring background jobs are successfully audited without crashing[cite: 40].

---

## 4. Security & Compliance (Redaction)

To ensure GDPR/CCPA compliance and maintain system security, the `GlobalAuditLogListener` contains a hardcoded `SENSITIVE_KEYS` set[cite: 40]. 

If a `UserPasswordChangedDomainEvent` is emitted containing the new hashed password, the listener intercepts it and transforms it:

```json
// Raw Event Payload
{
  "userId": "123-abc",
  "passwordHash": "$2b$10$xyz...",
  "occurredOn": "2026-08-11T12:00:00Z"
}

// Persisted Audit Log Payload
{
  "userId": "123-abc",
  "passwordHash": "[REDACTED]",
  "occurredOn": "2026-08-11T12:00:00Z",
  "_meta": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

---

## 5. Administration & Retrieval

Audit logs are strictly for internal compliance and security monitoring. They are accessible exclusively to platform administrators. 

The `SystemAdminController` exposes a `GET /admin/audit-logs` endpoint, protected by the `@Roles(ROLES.ADMIN)` guard. It allows administrators to retrieve a paginated history of system events, with optional filtering by `actorId` (to track a specific user's activity) or `eventName` (to track specific system behaviors).
