<img alt="HireSync" src="https://shieldcn.dev/header/gradient.svg?title=HireSync&subtitle=+a+modern+hiring+platform+that+connects+employers+with+qualified+talent+through+a+seamless+job+posting+and+application+experience&logo=lu%3ABriefcaseBusiness&size=wide&mode=dark&border=false">

## Overview

**HireSync** is a production-grade, backend-first hiring platform API built with **NestJS** and **TypeScript**. It connects employers with qualified talent through a seamless job posting and application experience — enabling companies to manage job openings while helping job seekers discover and apply for opportunities with ease.

The project is architected using **Clean Architecture** and **Hexagonal (Ports & Adapters) Architecture** principles, ensuring strict separation of concerns across Domain, Application, Infrastructure, and Presentation layers. Every module follows this layered structure, making the codebase highly testable, maintainable, and decoupled from external frameworks and libraries.

> **Note:** This is a backend REST API. There is no frontend client included in this repository.

---

## Architecture

HireSync follows a strict **Clean + Hexagonal Architecture** pattern. Each bounded context (module) is organized into four distinct layers:

```
src/<module>/
├── domain/              # Pure business rules, zero external dependencies
│   ├── entities/        # Rich domain entities extending AggregateRoot
│   ├── events/          # Domain events (intra-module side effects)
│   ├── exceptions/      # Domain-specific business rule exceptions
│   ├── repositories/    # Repository interfaces (contracts)
│   ├── types/           # Domain enums and types
│   └── value-objects/   # Encapsulated validation for specific fields
│
├── application/         # Orchestration & contracts
│   ├── use-cases/       # Business operation implementations
│   ├── ports/
│   │   ├── inbound/     # Interfaces for controllers to call
│   │   └── outbound/    # Interfaces for infrastructure to implement
│   └── exceptions/      # Application-level exceptions
│
├── infrastructure/      # Driven adapters (external integrations)
│   ├── adapters/        # Implements outbound ports (Prisma, Cloudinary, etc.)
│   ├── events/          # Domain event listeners
│   ├── mappers/         # Persistence ↔ Domain entity translators
│   ├── notifications/   # Email queue producers
│   ├── queues/          # BullMQ processors
│   └── tasks/           # Scheduled CRON jobs
│
├── presentation/        # Driving adapters (HTTP layer)
│   ├── controllers/     # REST endpoints, calls inbound ports
│   ├── dtos/            # Request validation & response shaping
│   ├── filters/         # Domain/Application → HTTP status mapping
│   ├── guards/          # Auth & role guards
│   ├── mappers/         # Use-case results → response DTOs
│   └── pipes/           # Custom validation pipes
│
└── <module>.module.ts   # NestJS dependency injection wiring
```

### Key Architectural Principles

- **Dependency Rule** — Core layers (Domain & Application) never depend on outer layers or third-party libraries
- **Ports & Adapters** — The Application layer _defines_ what it needs; Infrastructure _fulfills_ those needs
- **Rich Domain Entities** — Entities encapsulate both state and business rules (not anemic models)
- **Aggregate Root Pattern** — Entities that raise events extend `AggregateRoot`, which manages an internal event queue
- **Event-Driven Side Effects** — Domain Events trigger asynchronous workflows (emails, audit logs) without coupling the core transaction
- **Strict Environment Validation** — Type-safe environment configuration using `@t3-oss/env-core` with Zod schemas and conditional validation

### Request Lifecycle

```
Request → Middleware → Guards → Interceptors (Before) → Pipes → Controller
    → Use Case → Repository (Prisma) → Use Case → Controller
        → Interceptors (After) → Response
```

---

## Features

### 🔐 IAM (Identity & Access Management)

**Authentication**

- User registration with email verification (Nodemailer / Resend)
- Login / Logout with JWT access & refresh token strategy
- Password hashing with bcrypt
- Forgot password & reset password flows
- Refresh access token rotation via refresh tokens
- Resend email verification

**Multi-Factor Authentication (MFA / 2FA)**

- TOTP-based authentication using Speakeasy
- QR code generation for authenticator app setup
- 10 hashed backup/recovery codes on enrollment
- MFA-intercepted login flow with challenge tokens
- Enable / disable MFA with email notifications

**OAuth Integration**

- Manual OAuth implementation (no Passport.js)
- Google OAuth support (authorize → callback → token exchange)
- Link / unlink OAuth providers to existing accounts
- Set initial password for OAuth-only users
- Display connected OAuth providers on user profile

**Account Management**

- Update password (with old password verification)
- Update email address (with verification to old email)
- Upload / remove user avatar (Cloudinary)
- Scheduled account deletion with 14-day grace period
- Background job to permanently purge accounts after grace period
- Account restore within the grace period

**Account Security**

- Brute-force protection with account lockout (configurable max attempts & duration)
- Multi-device session management (view, revoke specific, revoke all)
- Session revocation on password change/reset
- Scheduled cleanup of expired sessions

**Role-Based Access Control (RBAC)**

- Dynamic roles stored in database (`ADMIN`, `EMPLOYER`, `APPLICANT`)
- Global `RolesGuard` enforcing route-level permissions

**User Management (Admin)**

- Get all users (admin)
- Get user by ID (admin & public views)

### 💼 Recruitment

**Employer Profiles**

- Create / edit company profile with industry & website
- Upload / remove company logo (Cloudinary)
- View company profiles (own & by ID)

**Job Listings**

- Full CRUD for job listings (create, edit, close)
- Configurable employment types: Full-time, Part-time, Contract, Freelance, Internship
- Location types: On-site, Hybrid, Remote
- Salary range with currency support
- Job status lifecycle: Draft → Published → Closed / Expired
- Search, filter, and paginated job listing queries
- Automatic job expiration via scheduled CRON task

**Applicant Profiles**

- Create / edit applicant profile (headline, bio)
- Multiple document management (up to 5 resumes + 5 cover letters)
- Set primary/default resume and cover letter
- Select specific documents when applying

**Job Applications**

- Apply for jobs with resume (PDF) and optional cover letter (TXT)
- View submitted applications
- Withdraw applications
- Save / unsave (bookmark) job listings
- Duplicate application prevention (unique constraint per applicant + job)

**Employer Application Management**

- View received applications per job listing
- Update application status (Pending → Reviewing → Shortlisted → Rejected → Hired)
- Bulk update application statuses
- Internal review notes (employer-only visibility)
- View applicants who applied for specific jobs

**Application History Timeline**

- Chronological event tracking per application
- Records: submissions, status changes, withdrawals, notes
- Public/private event visibility (internal notes hidden from applicants)

### 📧 Email Notifications

19 Handlebars email templates across IAM and Recruitment:

| Category           | Emails                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **Authentication** | Welcome, Farewell, Email Verification, Password Reset, Password Changed                        |
| **Account**        | Email Change Request, Email Changed Alert, Account Deletion Scheduled, Account Restored        |
| **Security**       | MFA Enabled, MFA Disabled                                                                      |
| **Recruitment**    | Employer Welcome, Applicant Welcome, Job Created, Job Closed                                   |
| **Applications**   | Application Submitted, Application Received, Application Status Updated, Application Withdrawn |

### 🔍 System & Compliance

**Global Audit Logging**

- Captures every domain event and persists to the `AuditLog` table
- Automatic redaction of sensitive data from audit payloads
- Indexed by event name, actor ID, and timestamp for fast querying
- Middleware-based actor context extraction from authenticated requests

---

## Tech Stack

### Core Framework

| Technology                                       | Purpose                               |
| ------------------------------------------------ | ------------------------------------- |
| [NestJS](https://nestjs.com/) v11                | Progressive Node.js framework         |
| [TypeScript](https://www.typescriptlang.org/) v5 | Type-safe development                 |
| [Prisma](https://www.prisma.io/) v7              | Type-safe ORM with PostgreSQL adapter |
| [Zod](https://zod.dev/) v4                       | Runtime schema validation             |

### Database & Caching

| Technology                                   | Purpose                            |
| -------------------------------------------- | ---------------------------------- |
| [PostgreSQL](https://www.postgresql.org/) 15 | Primary relational database        |
| [Redis](https://redis.io/) 7                 | Background job queue backing store |

### Authentication & Security

| Technology                                                  | Purpose                                |
| ----------------------------------------------------------- | -------------------------------------- |
| [@nestjs/jwt](https://github.com/nestjs/jwt)                | JWT access & refresh token management  |
| [bcryptjs](https://github.com/nicolo-ribaudo/bcrypt)        | Password hashing                       |
| [Speakeasy](https://github.com/speakeasyjs/speakeasy)       | TOTP-based multi-factor authentication |
| [QRCode](https://github.com/soldair/node-qrcode)            | QR code generation for MFA setup       |
| [@nestjs/throttler](https://github.com/nestjs/throttler)    | Rate limiting (short & medium windows) |
| [cookie-parser](https://github.com/expressjs/cookie-parser) | Secure cookie handling                 |

### Background Processing

| Technology                                                       | Purpose                                            |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| [BullMQ](https://bullmq.io/)                                     | Redis-backed background job queue                  |
| [@nestjs/schedule](https://github.com/nestjs/schedule)           | CRON-based task scheduling                         |
| [@nestjs/event-emitter](https://github.com/nestjs/event-emitter) | In-process event bus for domain/integration events |

### External Services

| Technology                              | Purpose                                                           |
| --------------------------------------- | ----------------------------------------------------------------- |
| [Cloudinary](https://cloudinary.com/)   | Image & document storage (avatars, logos, resumes, cover letters) |
| [Nodemailer](https://nodemailer.com/)   | SMTP email delivery                                               |
| [Resend](https://resend.com/)           | Transactional email API                                           |
| [Handlebars](https://handlebarsjs.com/) | Email template engine                                             |

### Validation & API

| Technology                                                          | Purpose                                   |
| ------------------------------------------------------------------- | ----------------------------------------- |
| [class-validator](https://github.com/typestack/class-validator)     | DTO request validation decorators         |
| [class-transformer](https://github.com/typestack/class-transformer) | DTO auto-transformation                   |
| [@nestjs/swagger](https://github.com/nestjs/swagger)                | OpenAPI / Swagger documentation           |
| [@t3-oss/env-core](https://env.t3.gg/)                              | Type-safe environment variable validation |
| [Multer](https://github.com/expressjs/multer)                       | Multipart file upload handling            |

### Developer Experience

| Technology                                         | Purpose                           |
| -------------------------------------------------- | --------------------------------- |
| [ESLint](https://eslint.org/) v9                   | Code linting                      |
| [Prettier](https://prettier.io/) v3                | Code formatting                   |
| [Docker Compose](https://docs.docker.com/compose/) | Local PostgreSQL & Redis services |
| [Jest](https://jestjs.io/) v30                     | Testing framework                 |

---

## Project Structure

```
hiresync/
├── prisma/
│   ├── models/
│   │   ├── iam.prisma              # User, Account, Session, Role, OAuthAccount
│   │   ├── recruitment.prisma      # Employer, Job, Applicant, Application, Documents
│   │   └── system.prisma           # AuditLog
│   ├── migrations/
│   ├── schema.prisma               # Datasource & enum definitions
│   └── seed.ts                     # Database seeding
│
├── src/
│   ├── iam/                        # Identity & Access Management module
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   │   ├── authentication/     # Register, Login, MFA Login, OAuth, etc.
│   │   │   │   ├── account/            # Password, Email, Avatar, Sessions, MFA, OAuth
│   │   │   │   ├── users/              # User CRUD operations
│   │   │   │   └── roles/              # Role management
│   │   │   └── ports/
│   │   │       ├── inbound/            # Use case interfaces
│   │   │       └── outbound/           # Repository, hash, JWT, crypto, etc.
│   │   ├── domain/
│   │   │   ├── entities/               # User, Account, Session, Role, OAuthAccount
│   │   │   ├── events/                 # Auth & account domain events
│   │   │   └── value-objects/          # Email, UserId, MfaConfiguration, etc.
│   │   ├── infrastructure/
│   │   │   ├── adapters/               # Prisma, bcrypt, JWT, Cloudinary, OAuth, etc.
│   │   │   ├── events/                 # Domain event listeners
│   │   │   ├── notifications/          # Email queue producers
│   │   │   └── tasks/                  # Session cleanup, account deletion CRON
│   │   └── presentation/
│   │       ├── controllers/            # Auth, Account, Admin, OAuth, User
│   │       ├── dtos/                   # Request/response DTOs
│   │       ├── filters/                # Exception → HTTP status mapping
│   │       └── guards/                 # JWT & auth guards
│   │
│   ├── recruitment/                # Recruitment module
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       ├── employers/          # Company profile CRUD
│   │   │       ├── jobs/               # Job listing CRUD, search, filter
│   │   │       ├── applicants/         # Applicant profile & documents
│   │   │       ├── applications/       # Apply, withdraw, status, bookmarks
│   │   │       └── notifications/      # Recruitment email queue
│   │   ├── domain/
│   │   │   ├── entities/               # EmployerProfile, JobListing, Applicant, etc.
│   │   │   └── value-objects/          # SalaryRange, JobLocation, CompanyWebsite, etc.
│   │   ├── infrastructure/
│   │   │   ├── adapters/               # Prisma repositories, Cloudinary
│   │   │   ├── events/                 # Recruitment event listeners
│   │   │   ├── notifications/          # Email queue producers
│   │   │   ├── queues/                 # BullMQ processors
│   │   │   └── tasks/                  # Job expiration CRON
│   │   └── presentation/
│   │       ├── controllers/            # Employer, Applicant, Recruitment
│   │       └── dtos/
│   │
│   ├── system/                     # System & compliance module
│   │   ├── application/
│   │   │   └── use-cases/              # Audit log retrieval
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   │   └── adapters/               # Audit log persistence adapter
│   │   └── presentation/
│   │       └── controllers/            # Audit log endpoints
│   │
│   ├── shared/                     # Cross-cutting concerns
│   │   ├── core/                       # AggregateRoot base, BaseException
│   │   ├── database/                   # Prisma database module
│   │   ├── email/                      # Email module, adapters, ports, templates
│   │   ├── events/                     # Domain/Integration event base, registry, adapters
│   │   ├── http/                       # Guards, filters, interceptors, middlewares, DTOs
│   │   ├── logger/                     # Logging utilities
│   │   ├── queue/                      # BullMQ queue module
│   │   ├── types/                      # Shared types
│   │   └── utils/                      # ID generation, app links, etc.
│   │
│   ├── generated/                  # Prisma-generated client
│   ├── app.module.ts               # Root module wiring
│   ├── main.ts                     # Application bootstrap & Swagger setup
│   └── env.ts                      # Type-safe env config with Zod
│
├── docs/
│   ├── architecture/               # Naming conventions, events, mappers, etc.
│   ├── features/                   # Auth, MFA, OAuth, sessions, audit logging
│   ├── background-tasks/           # CRON job documentation
│   ├── integration/                # Cloudinary setup
│   └── frontend/                   # Frontend integration guides
│
├── docker-compose.yml              # PostgreSQL 15 + Redis 7
├── generate-module.sh              # Clean architecture module scaffolder
├── prisma.config.ts
├── package.json
└── tsconfig.json
```

---

## Domain Events

HireSync uses an event-driven architecture with a centralized event registry. Events flow through three phases:

1. **Core Transaction** — Use case persists data, entity records domain event into its `AggregateRoot` queue
2. **Event Reaction** — `DomainEventPublisherPort` broadcasts events via NestJS EventEmitter; infrastructure listeners enqueue side effects (emails, audit entries)
3. **Background Processing** — BullMQ processors pick up queued jobs from Redis and execute delivery

**54+ registered events** across IAM and Recruitment domains, including:

- Authentication events (login, registration, verification, password reset)
- Account lifecycle events (profile updates, deletion, restoration)
- Security events (MFA enable/disable, OAuth link/unlink, failed login)
- Recruitment events (job CRUD, application lifecycle, document management)

---

## Scheduled Tasks

| Task                      | Schedule | Description                                                                              |
| ------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| Expire Job Listings       | CRON     | Automatically transitions published jobs past their `expiresAt` date to `EXPIRED` status |
| Execute Pending Deletions | CRON     | Permanently deletes accounts that have passed the 14-day grace period                    |
| Clean Expired Sessions    | CRON     | Removes expired/revoked sessions from the database                                       |

---

## Getting Started

### Prerequisites

- **Node.js** (v20+)
- **Docker** & **Docker Compose** (for PostgreSQL & Redis)
- **Cloudinary** account
- **Resend** API key or SMTP credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/hiresync.git
cd hiresync

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration (see Environment Variables below)

# Start PostgreSQL and Redis
npm run services:up

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database (roles, etc.)
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

| Variable                          | Required | Description                                     |
| --------------------------------- | -------- | ----------------------------------------------- |
| `NODE_ENV`                        | ✅       | `development`, `test`, or `production`          |
| `APP_NAME`                        | ✅       | Application name used in emails                 |
| `APP_URL`                         | ✅       | Base URL of the application                     |
| `PORT`                            | ❌       | Server port (default: `3000`)                   |
| `DATABASE_URL`                    | ✅       | PostgreSQL connection string                    |
| `JWT_ACCESS_SECRET`               | ✅       | JWT access token secret (min 128 chars)         |
| `JWT_ACCESS_EXPIRES_IN`           | ❌       | Access token TTL (default: `15m`)               |
| `JWT_REFRESH_SECRET`              | ✅       | JWT refresh token secret (min 128 chars)        |
| `JWT_REFRESH_EXPIRES_IN`          | ❌       | Refresh token TTL (default: `7d`)               |
| `VERIFICATION_TOKEN_EXPIRES_IN`   | ❌       | Email verification token TTL (default: `24h`)   |
| `PASSWORD_RESET_TOKEN_EXPIRES_IN` | ❌       | Password reset token TTL (default: `1h`)        |
| `GRACE_PERIOD_ACCOUNT_DELETION`   | ❌       | Deletion grace period (default: `14d`)          |
| `MAX_LOGIN_ATTEMPTS`              | ❌       | Failed logins before lockout (default: `5`)     |
| `ACCOUNT_LOCKOUT_DURATION`        | ❌       | Lockout window (default: `15m`)                 |
| `MFA_CHALLENGE_TOKEN_EXPIRES_IN`  | ❌       | MFA challenge TTL (default: `5m`)               |
| `REDIS_URL`                       | ❌       | Redis connection URL (for BullMQ)               |
| `EMAIL_PROVIDER`                  | ✅       | `nodemailer` or `resend`                        |
| `FROM_EMAIL`                      | ❌       | Sender email (default: `onboarding@resend.dev`) |
| `RESEND_API_KEY`                  | ⚠️       | Required when `EMAIL_PROVIDER=resend`           |
| `SMTP_HOST`                       | ⚠️       | Required when `EMAIL_PROVIDER=nodemailer`       |
| `SMTP_PORT`                       | ⚠️       | Required when `EMAIL_PROVIDER=nodemailer`       |
| `SMTP_SECURE`                     | ⚠️       | Required when `EMAIL_PROVIDER=nodemailer`       |
| `SMTP_USER`                       | ⚠️       | Required when `EMAIL_PROVIDER=nodemailer`       |
| `SMTP_PASS`                       | ⚠️       | Required when `EMAIL_PROVIDER=nodemailer`       |
| `CLOUDINARY_CLOUD_NAME`           | ✅       | Cloudinary cloud name                           |
| `CLOUDINARY_API_KEY`              | ✅       | Cloudinary API key                              |
| `CLOUDINARY_API_SECRET`           | ✅       | Cloudinary API secret                           |
| `GOOGLE_CLIENT_ID`                | ✅       | Google OAuth client ID                          |
| `GOOGLE_CLIENT_SECRET`            | ✅       | Google OAuth client secret                      |
| `GOOGLE_REDIRECT_URI`             | ✅       | Google OAuth redirect callback URI              |

### Available Scripts

```bash
npm run dev              # Start development server (watch mode)
npm run build            # Build for production
npm run start:prod       # Run production build

npm run services:up      # Start PostgreSQL + Redis via Docker
npm run services:down    # Stop Docker services
npm run dev:full         # Start services + dev server
npm run dev:hybrid       # Start Redis only + dev server

npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run pending migrations
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Seed the database
npm run db:format        # Format Prisma schema

npm run lint             # Run ESLint with auto-fix
npm run format           # Format code with Prettier
npm run format:check     # Check formatting

npm run generate:module  # Scaffold a new hexagonal architecture module

npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Run tests with coverage
npm run test:e2e         # Run end-to-end tests
```

---

## API Documentation

When running in `development` or `test` mode, Swagger UI is automatically available at:

```
http://localhost:3000/api/docs
```

All API routes are prefixed with `/api`.

### API Modules

| Module         | Base Route        | Controllers                                            |
| -------------- | ----------------- | ------------------------------------------------------ |
| **Auth**       | `/api/auth`       | Register, Login, Logout, OAuth, MFA, Verify, Reset     |
| **Account**    | `/api/account`    | Profile, Password, Email, Avatar, Sessions, MFA, OAuth |
| **Users**      | `/api/users`      | Public user lookup                                     |
| **Admin**      | `/api/admin`      | User management (admin-only)                           |
| **Employers**  | `/api/employers`  | Company profiles, job listings, applications           |
| **Applicants** | `/api/applicants` | Applicant profiles, documents, applications, bookmarks |
| **Jobs**       | `/api/jobs`       | Public job search, filter, view                        |
| **Audit Logs** | `/api/audit-logs` | System activity history                                |

---

## Database Schema

The database is organized into three Prisma model files with PostgreSQL-native enums:

**IAM Models:** `User`, `Account`, `Session`, `Role`, `OAuthAccount`

**Recruitment Models:** `EmployerProfile`, `JobListing`, `ApplicantProfile`, `ApplicantDocument`, `JobApplication`, `JobApplicationHistory`, `SavedJob`

**System Models:** `AuditLog`

**Enums:** `EmploymentType`, `LocationType`, `JobStatus`, `ApplicationStatus`, `ApplicationEventType`, `DocumentType`

---

## Roadmap

### Phase 3 (Planned)

- **Payment Integration** — Stripe subscription tiers for premium features (document limits, application caps, session limits)
- **AI Integration** — AI-powered cover letter generation, profile headline/bio optimization
- **GitHub OAuth** — Additional OAuth provider support
- **Microsoft OAuth** — Additional OAuth provider support
- **Data Export** — GDPR/CCPA compliance user data export as JSON
- **Anomaly Detection** — Unusual login activity detection (new country, impossible travel)
- **Session Limits** — Configurable maximum active sessions per user

---

## License

This project is open source and available to the public.
