# Feature Implementation Guidelines

When creating new features, ALWAYS follow these guidelines:

## Rules:
- Inward to Outward (Domain -> Application -> Infrastructure -> Presentation)
- Core layers (Domain and Application) must not depend directly on third-party libraries or Infrastructure implementations.
- No type of "any"
- Define exceptions either Domain or Application Exceptions
- When an implementation needs a third-party library or external dependency, access it through an outbound port implemented by an Infrastructure adapter.
- Always follow SRP (Single Responsibility Principle)
- Always follow the Hexagonal Architecture principles
- When logging needed use the shared Logger
- When generating and id is needed, use the shared id generator from the shared utils
- When pagination is needed, use the shared pagination dto from the shared http/dtos
- On creating an email template with link, define the link using the shared utils app-links

## Always do these before implementation:
- Ask me the updated repository codebase (so I will attach the updated repository link)
- Ask me for the files to match exactly my current implementations of some files

## Layers:

### Domain

- Entity - Create entity here, responsible for domain logic and raising domain events
- Events (Domain Events)
- Exceptions - business rules and validation exceptions
- Repository - interface for data access
- Types - types and enums 
- Value Objects

### Application

- Exceptions - application exceptions
- Ports (Inbound/Outbound) - inbound and outbound ports for communication with the infrastructure layer / interfaces
- Use Cases - implementation of inbound ports

### Infrastructure

- Adapters (Persistence, External Services)
- Events (Listeners)
- Mappers (Translates persistence or external records to domain entities)
- Notifications (e.g., email, SMS)
- Queues (e.g., BullMQ)
- Tasks (cron jobs with NestJS Schedule)

### Presentation

- Controllers
- DTOS (Request/Response)
- Filters (Mapping of Domain and Application Exceptions, Exception -> Proper HTTP Status)
- Mappers (Translates use-case results to response DTOs)

### Prisma - (Outside the main `src` directory)
- Migrations
- Models
- schema.prisma
