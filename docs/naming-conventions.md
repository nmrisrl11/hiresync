# Naming Conventions (Clean + Hexagonal Architecture)

This document defines the naming conventions used throughout the project to keep the codebase consistent and aligned with Clean Architecture and Hexagonal Architecture principles.

---

# Core Principle

- **Business concepts are singular.**
- **REST resources are plural.**
- **Actions are verbs.**
- **Interfaces describe capabilities, not implementations.**

---

# Layer Conventions

## Domain Layer

The domain models business concepts, so names should always be **singular**.

### Entities

✅ Good

```text
User
Account
Order
Product
Invoice
```

❌ Avoid

```text
Users
Accounts
Orders
```

---

### Value Objects

Always singular.

```text
Email
Password
Money
Address
UserId
```

---

### Domain Services

Name after the business capability.

```text
PasswordHasher
PaymentCalculator
TokenGenerator
PricingPolicy
```

Avoid generic names like:

```text
UserService
AccountService
```

unless it is truly a domain service.

---

### Repository Interfaces

Repository interfaces represent persistence ports.

```text
UserRepository
AccountRepository
OrderRepository
```

Methods should describe intent.

```ts
findById()
findByEmail()
exists()
save()
delete()
```

Avoid:

```ts
getUsers()
createUser()
updateUser()
```

Repositories persist entities—they should not implement business actions.

---

## Application Layer

Application services (use cases) describe actions.

Use:

```text
CreateUser
UpdateUser
DeleteUser
GetUser
ListUsers

CreateAccount
SuspendAccount
ActivateAccount
```

Notice:

- Single entity → singular
- Collection query → plural

Examples:

```text
GetUser
ListUsers

GetAccount
ListAccounts
```

---

### Commands

```text
CreateUserCommand
UpdateAccountCommand
DeleteOrderCommand
```

---

### Queries

```text
GetUserQuery
ListUsersQuery
SearchProductsQuery
```

---

### DTOs

DTOs are singular unless they literally contain collections.

```text
CreateUserDto
UpdateUserDto
UserResponseDto
LoginDto
```

Collection DTOs:

```text
ListUsersResponseDto
PaginatedUsersDto
```

---

## Presentation Layer (HTTP)

### Controllers

Controllers represent a feature.

Use singular names.

```text
UserController
AccountController
AuthController
```

---

### REST Routes

REST endpoints represent collections.

Use plural.

```http
/users
/accounts
/orders
/products
```

Examples:

```http
GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id
```

---

### Nested Resources

```http
/users/:id/orders
/accounts/:id/sessions
```

---

### Administrative APIs

Treat `admin` as a namespace, **not** a resource.

Good:

```http
/admin/users
/admin/accounts
/admin/orders
```

Avoid:

```http
/admins
```

unless `Admin` is an actual domain entity.

---

## Infrastructure Layer

Implementations should clearly indicate the technology.

Repositories:

```text
PrismaUserRepository
TypeOrmUserRepository
MongoUserRepository
```

Adapters:

```text
JwtTokenGenerator
BcryptPasswordHasher
S3FileStorage
StripePaymentGateway
```

Persistence models:

```text
UserModel
AccountModel
OrderSchema
```

---

# Folder Naming

Feature folders should be singular because they represent a business capability.

```text
src/
    user/
    account/
    auth/
    order/
```

Inside each feature:

```text
user/
    domain/
    application/
    infrastructure/
    presentation/
```

---

# Interface Naming

Avoid prefixing interfaces with `I`.

Use:

```text
UserRepository
PasswordHasher
TokenGenerator
Clock
```

Instead of:

```text
IUserRepository
IPasswordHasher
```

The implementation should contain the technology.

Example:

```text
UserRepository
└── PrismaUserRepository
```

---

# Service Naming

Only use the `Service` suffix when it genuinely represents a service.

Good:

```text
AuthenticationService
EmailService
NotificationService
```

Avoid catch-all services like:

```text
UserService
AccountService
```

Prefer explicit use cases instead.

Instead of:

```text
UserService.create()
```

Prefer:

```text
CreateUser
UpdateUser
DeleteUser
```

---

# Mapper Naming

```text
UserMapper
AccountMapper
OrderMapper
```

---

# Exception Naming

```text
UserAlreadyExistsException
AccountSuspendedException
InvalidCredentialsException
```

---

# Event Naming

Events describe something that has already happened.

```text
UserCreated
AccountActivated
OrderPaid
PasswordChanged
```

Past tense is preferred.

---

# Enum Naming

Enums are singular.

```text
UserRole
OrderStatus
AccountType
```

Enum values are uppercase.

```text
ADMIN
CUSTOMER
PENDING
PAID
CANCELLED
```

---

# Database Naming

Tables may be singular or plural, but the project must remain consistent.

Plural (recommended):

```text
users
accounts
orders
```

Columns:

```text
id
email
created_at
updated_at
deleted_at
```

Foreign keys:

```text
user_id
account_id
order_id
```

---

# Naming Summary

| Layer | Convention | Example |
|--------|------------|---------|
| Entity | Singular | `User` |
| Value Object | Singular | `Email` |
| Repository | Singular | `UserRepository` |
| Repository Implementation | Technology + Repository | `PrismaUserRepository` |
| Use Case | Verb + Singular | `CreateUser` |
| Command | Verb + Singular + Command | `CreateUserCommand` |
| Query | Verb + Target + Query | `GetUserQuery`, `ListUsersQuery` |
| DTO | Singular | `CreateUserDto` |
| Controller | Singular | `UserController` |
| REST Route | Plural | `/users` |
| Folder | Singular | `user/` |
| Mapper | Singular | `UserMapper` |
| Event | Past Tense | `UserCreated` |
| Exception | Descriptive | `UserAlreadyExistsException` |
| Enum | Singular | `UserRole` |
| Database Table | Plural (recommended) | `users` |

---

# Example

```text
src/
└── user/
    ├── domain/
    │   ├── user.ts
    │   ├── user.repository.ts
    │   └── user-created.event.ts
    │
    ├── application/
    │   ├── create-user/
    │   │   ├── create-user.ts
    │   │   ├── create-user.command.ts
    │   │   └── create-user.handler.ts
    │   │
    │   └── list-users/
    │       ├── list-users.ts
    │       ├── list-users.query.ts
    │       └── list-users.handler.ts
    │
    ├── infrastructure/
    │   ├── prisma-user.repository.ts
    │   └── user.mapper.ts
    │
    └── presentation/
        ├── user.controller.ts
        ├── create-user.dto.ts
        └── user-response.dto.ts
```

This organization emphasizes:
- Singular names for domain concepts.
- Plural names for REST resources.
- Explicit, verb-based use cases.
- Technology-specific infrastructure implementations.
- Clear separation of responsibilities across layers.