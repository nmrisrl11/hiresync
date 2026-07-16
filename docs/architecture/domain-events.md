# Event-Driven Architecture: Domain Events & Side Effects

## Overview
Our application utilizes an Event-Driven Architecture (EDA) alongside our Hexagonal (Ports & Adapters) foundation. This design pattern strictly decouples our core domain logic (e.g., registering a user) from external side effects (e.g., sending an email or pushing to a Redis queue). 

By using Domain Events, we guarantee that third-party failures (like an email provider outage) will never roll back or corrupt a successful core business transaction.

---

## The Start-to-Finish Flow
When a side-effect is triggered (such as sending a verification email upon registration), the system executes across three distinct phases.

### Phase 1: The Core Transaction (Synchronous)
1. **The Request:** The Next.js client sends a `POST /auth/register` request.
2. **The Controller:** The `AuthController` maps the payload to a `RegisterUserCommand` and triggers the `RegisterUserUseCase`.
3. **The Aggregate Root:** The `User` entity is instantiated via `User.createForRegistration()`. Internally, the entity records a `UserRegisteredDomainEvent` into its private `domainEvents` array. 
4. **The Persistence:** The Use Case successfully commits the user data to PostgreSQL via Prisma.
5. **The Dispatch:** The Use Case calls the injected `DomainEventDispatcherPort` to broadcast all collected events, then clears the entity's event queue.
6. **The Response:** The Use Case immediately returns a success state (`{ userId: string }`) to the Controller, completing the HTTP request (Optimistic UI).

### Phase 2: The Event Reaction (Asynchronous)
7. **The Bus:** The `NestjsEventDispatcherAdapter` pushes the event across the internal Node.js event bus.
8. **The Listener:** The `UserRegisteredListener` (acting as an inbound adapter in the Presentation Layer) catches the event.
9. **The Command:** The listener formats an `EnqueueVerificationEmailCommand` and triggers the `EnqueueVerificationEmailUseCase`.
10. **The Queue Adapter:** The Use Case maps the data and sends it to the `BullMqEmailQueueAdapter`, dropping a job into the local Redis `email` queue.

### Phase 3: The Background Worker (Isolated Process)
11. **The Processor:** The `EmailProcessor` detects the new job in Redis.
12. **The Delivery:** The processor calls the `EmailService`, which compiles the Handlebars template and executes the delivery via our chosen provider (Resend/Nodemailer).

---

## Layer-by-Layer Implementation Guide

### 1. Domain Layer (`src/shared/domain/`)
All entities that trigger events must extend the `AggregateRoot` base class, which provides the mechanism to store and clear events.

```typescript
// src/iam/domain/entities/user.entity.ts
export class User extends AggregateRoot {
	public static createForRegistration(/* args */): User {
		const user = new User(/* ... */);
		
		// Record the event in memory; do not dispatch it yet.
		user.addDomainEvent(new UserRegisteredDomainEvent(email, token, ttl));
		return user;
	}
}
```

### 2. Application Layer (`src/shared/application/ports/outbound/`)
The core Use Cases interact with an abstract dispatcher port, ensuring they remain completely unaware of the underlying framework (NestJS).

```typescript
export abstract class DomainEventDispatcherPort {
	abstract dispatch(event: DomainEvent): Promise<void>;
	abstract dispatchMultiple(events: DomainEvent[]): Promise<void>;
}
```

### 3. Infrastructure Layer (`src/shared/infrastructure/adapters/outbound/`)
The outbound adapter implements the dispatcher port using the `@nestjs/event-emitter` framework.

```typescript
@Injectable()
export class NestjsEventDispatcherAdapter implements DomainEventDispatcherPort {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	public async dispatch(event: DomainEvent): Promise<void> {
		await this.eventEmitter.emitAsync(event.constructor.name, event);
	}
    // ... dispatchMultiple implementation
}
```

### 4. Presentation Layer (`src/iam/presentation/event-listeners/`)
Event listeners strictly belong in the Presentation Layer because they act exactly like HTTP Controllers: they are **entry points** that listen for external signals (events) and translate them into Commands for the Application layer.

```typescript
@Injectable()
export class UserRegisteredListener {
	constructor(private readonly enqueueEmailUseCase: EnqueueVerificationEmailUseCasePort) {}

	@OnEvent("UserRegisteredDomainEvent", { async: true })
	public async handle(event: UserRegisteredDomainEvent): Promise<void> {
		const command = new EnqueueVerificationEmailCommand(/* args */);
		await this.enqueueEmailUseCase.execute(command);
	}
}
```