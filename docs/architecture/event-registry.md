# Shared Architecture: Centralized Event Registry

## Overview
In Event-Driven Architecture (EDA), domain and integration events act as the internal API contract of the application. To ensure stability, readability, and protection against build processes, we utilize a centralized Event Registry.

All event names are explicitly defined as `SCREAMING_SNAKE_CASE` strings inside a single constant object (`EVENT_NAMES`) located in the shared kernel (`src/shared/events/event-names.ts`).

---

## Architecture & Design Rationale

### 1. Protection Against Minification
If event routing relies on TypeScript class names (e.g., `event.constructor.name`), production builds that minify or mangle code (like Webpack or SWC) will compress `UserRegisteredDomainEvent` into unpredictable variables like `t3`. This breaks event listeners and ruins database audit logs. Explicit string constants are immune to minification.

### 2. Decoupling Domain from Implementation
Databases, audit logs, and external message brokers (if extracted to microservices) should care about the *business concept* (`USER_REGISTERED`), not the internal TypeScript implementation. By decoupling the name from the class, we can refactor and rename our TypeScript files at any time without breaking historical database queries.

### 3. Single Source of Truth
The `EVENT_NAMES` constant serves as a central registry. Developers (and frontend clients via the `/api/admin/audit-logs/meta` endpoint) can instantly see every possible event the system emits without hunting through directories.

---

## Implementation Guide

### 1. Defining the Constant
Add the new event to `src/shared/events/event-names.ts`.

```typescript
export const EVENT_NAMES = {
	USER_LOGGED_IN: "USER_LOGGED_IN",
	JOB_APPLICATION_SUBMITTED: "JOB_APPLICATION_SUBMITTED",
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];
```

### 2. Implementing the Event Class
The base `DomainEvent` and `IntegrationEvent` classes force child classes to define an `eventName` property. You must assign the constant to this property.

```typescript
import { DomainEvent, EVENT_NAMES } from "@/shared/events";

export class UserLoggedInDomainEvent extends DomainEvent {
	public readonly eventName = EVENT_NAMES.USER_LOGGED_IN;

	constructor(
		public readonly userId: string,
		public readonly sessionId: string,
	) {
		super();
	}
}
```

### 3. Binding the Listener
When creating an event listener in the Infrastructure layer, always bind it to the constant, never the class type string.

```typescript
import { EVENT_NAMES } from "@/shared/events";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class UserLoggedInListener {
	@OnEvent(EVENT_NAMES.USER_LOGGED_IN, { async: true })
	public async handle(event: UserLoggedInDomainEvent): Promise<void> {
		// Handle event
	}
}
```
