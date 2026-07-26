# Integration Events: Inter-Module Architecture

## Overview
Integration Events are designed for cross-module communication. They are lightweight, living in a `shared` kernel, and typically contain only primitive identifiers. They allow modules to react to each other without importing each other's domain logic, preventing tight coupling between distinct bounded contexts (e.g., IAM and Recruitment).

---

## The Cross-Module Flow (The Cascade Trap)
When an action in one module affects data in another (e.g., IAM deleting a User requires Recruitment to delete associated Cloudinary assets), we use Integration Events. 

**Critical Pattern: Pre-Delete Hooks**
If the database schema utilizes `onDelete: Cascade`, an asynchronous post-delete event will fail because the associated data (like Cloudinary `public_id` URLs) is wiped from the database instantly. To solve this, Integration Events are published *before* the database transaction commits.

1. **Broadcast Intent:** The IAM module publishes a `UserAccountDeletingIntegrationEvent` via `IntegrationEventPublisherPort.publishAsync()`.
2. **Pause & Await:** The execution pauses while the Recruitment module listener catches the event, fetches the Cloudinary URLs from the database, and queues them into the background worker for deletion.
3. **Commit Deletion:** Once listeners resolve, IAM executes the actual database deletion, safely cascading the rows without leaving orphaned files in the cloud.

---

## Layer-by-Layer Implementation Guide

### 1. Shared Kernel (`src/shared/infrastructure/events/integration/`)
Integration events extend a shared base class and live outside specific bounded contexts.

```typescript
// src/shared/infrastructure/events/integration/integration-event.base.ts
export abstract class IntegrationEvent {
	public readonly occurredOn: Date = new Date();
}

// src/shared/infrastructure/events/integration/user-account-deleting.integration-event.ts
export class UserAccountDeletingIntegrationEvent extends IntegrationEvent {
	constructor(public readonly userId: string) {
		super();
	}
}
```

### 2. Application Layer (`src/shared/application/ports/outbound/`)
Similar to Domain Events, modules use an abstract port to publish Integration Events without knowing the framework details.

```typescript
export abstract class IntegrationEventPublisherPort {
	abstract publishAsync(event: IntegrationEvent): Promise<void>;
	abstract publishMultipleAsync(events: IntegrationEvent[]): Promise<void>;
}
```

### 3. Infrastructure Layer (`src/shared/infrastructure/adapters/events/`)
The outbound adapter implements the publisher port, specifically designed for cross-boundary messaging.

```typescript
@Injectable()
export class NestIntegrationEventPublisherAdapter implements IntegrationEventPublisherPort {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	public async publishAsync(event: IntegrationEvent): Promise<void> {
		// Routes using the exact class name (e.g., "UserAccountDeletingIntegrationEvent")
		await this.eventEmitter.emitAsync(event.constructor.name, event);
	}

	public async publishMultipleAsync(events: IntegrationEvent[]): Promise<void> {
		for (const event of events) {
			await this.publishAsync(event);
		}
	}
}
```

### 4. Infrastructure Layer (`src/*/infrastructure/events/listeners/`)
Listeners reside in the responding module's infrastructure layer, catching the shared event and triggering local use cases.

```typescript
@Injectable()
export class RecruitmentUserAccountDeletingListener {
	constructor(private readonly cleanupDataUseCase: CleanupRecruitmentDataUseCasePort) {}

	@OnEvent(UserAccountDeletingIntegrationEvent.name, { async: true, promisify: true })
	public async handle(event: UserAccountDeletingIntegrationEvent): Promise<void> {
		// Triggers the background cleanup of external cloud assets before DB cascade
		await this.cleanupDataUseCase.execute(event.userId);
	}
}
```
