# Domain Events: Intra-Module Architecture

## Overview
Domain Events are strictly internal to a single Bounded Context (module). They carry rich domain data and are used to trigger side effects *within the same module* (e.g., an IAM registration triggers an IAM email queue). 

By utilizing this architecture, we guarantee that external failures (like an email provider outage) do not roll back successful core business transactions.

---

## The Start-to-Finish Flow
When an internal side-effect is triggered, the system executes across three distinct phases.

### Phase 1: The Core Transaction (Synchronous)
1. **The Request:** The Next.js client sends a `POST /auth/register` request.
2. **The Controller:** The `AuthController` maps the payload to a Command and triggers the Use Case.
3. **The Aggregate Root:** The `User` entity is instantiated. Internally, it records a `UserRegisteredDomainEvent` into its private `domainEvents` array.
4. **The Persistence:** The Use Case successfully commits the user data to PostgreSQL via Prisma.
5. **The Publish:** The Use Case calls the injected `DomainEventPublisherPort` to broadcast all collected events, then clears the entity's event queue.
6. **The Response:** The Use Case immediately returns a success state to the Controller, completing the HTTP request (Optimistic UI).

### Phase 2: The Event Reaction (Asynchronous)
7. **The Bus:** The `NestDomainEventPublisherAdapter` pushes the event across the internal Node.js event bus.
8. **The Listener:** The `UserRegisteredListener` (located in the Infrastructure layer) catches the event.
9. **The Command:** The listener formats an `EnqueueVerificationEmailCommand` and triggers the notification Use Case.
10. **The Queue Adapter:** The Use Case sends the job to the BullMQ adapter, dropping it into the local Redis queue.

### Phase 3: The Background Worker (Isolated Process)
11. **The Processor:** The `EmailProcessor` detects the new job.
12. **The Delivery:** The processor executes the delivery via the external provider.

---

## Layer-by-Layer Implementation Guide

### 1. Domain Layer (`src/*/domain/`)
Entities that trigger events extend the `AggregateRoot`, which manages the event queue. 

```typescript
// src/iam/domain/entities/user.entity.ts
export class User extends AggregateRoot {
	public delete(): void {
		this.addDomainEvent(new UserAccountDeletedDomainEvent(this.id.getValue(), this.email.getValue()));
	}
}
```

### 2. Shared Layer: Ports (`src/shared/events/ports/`)
Core Use Cases interact with abstract Publisher ports, remaining strictly agnostic to NestJS or EventEmitter.

```typescript
export abstract class DomainEventPublisherPort {
	abstract publish(event: DomainEvent): Promise<void>;
	abstract publishMultiple(events: DomainEvent[]): Promise<void>;
}
```

### 3. Shared Layer: Adapters (`src/shared/events/adapters/`)
The outbound adapter implements the publisher port using `@nestjs/event-emitter`. We route events using their class name dynamically.

```typescript
@Injectable()
export class NestDomainEventPublisherAdapter implements DomainEventPublisherPort {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	public async publish(event: DomainEvent): Promise<void> {
		await this.eventEmitter.emitAsync(event.constructor.name, event);
	}

	public async publishMultiple(events: DomainEvent[]): Promise<void> {
		for (const event of events) {
			await this.publish(event);
		}
	}
}
```

### 4. Infrastructure Layer (`src/*/infrastructure/events/listeners/`)
Event listeners act as internal adapters that bridge the gap between the application's message bus and the Application Layer's Use Cases. 

```typescript
@Injectable()
export class UserRegisteredListener {
	constructor(private readonly enqueueEmailUseCase: EnqueueVerificationEmailUseCasePort) {}

	@OnEvent("UserRegisteredDomainEvent", { async: true })
	public async handle(event: UserRegisteredDomainEvent): Promise<void> {
		const command = new EnqueueVerificationEmailCommand(event.email);
		await this.enqueueEmailUseCase.execute(command);
	}
}
```
