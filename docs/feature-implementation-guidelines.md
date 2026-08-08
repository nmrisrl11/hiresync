# Feature Implementation Guidelines

When creating new features, follow these guidelines:

## Rules:
- Inward to Outward (Domain -> Application -> Infrastructure -> Presentation)
- No direct usage of third party library or dependencies on Core Layer (Domain and Application)
- No type of "any"
- Define exceptions either Domain or Application Exceptions
- When implementation need to use a third party library or dependency, it should be done on the Infrastructure Layer through an outbound port and adapter (Dependency Inversion)
- Always follow SRP (Single Responsibility Principle)
- Always follow the Hexagonal Architecture principles
- When logging needed use the shared Logger

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
- Mappers (Mapping Domain Entities to DTOs and vice versa)
- Notifications (e.g., email, SMS)
- Queues (e.g., BullMQ)
- Tasks (cron jobs with NestJS Schedule)

### Presentation

- Controllers
- DTOS (Request/Response)
- Filters (Mapping of Domain and Application Exceptions, Exception -> Proper HTTP Status)
- Mappers (Mapping of Use Cases Results to DTOs Response)

### Prisma
- Migrations
- Models
- schema.prisma
