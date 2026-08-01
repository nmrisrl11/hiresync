# Infrastructure Architecture: Domain Mappers (Anti-Corruption Layer)

## Overview
In Clean Architecture and Domain-Driven Design (DDD), the **Infrastructure Layer** is responsible for persistence and external data access. However, databases and Object-Relational Mappers (ORMs) like Prisma work with flat, table-oriented data structures, whereas our **Domain Layer** operates on behavior-rich Entities, Aggregate Roots, and Value Objects.

**Infrastructure Mappers** (`IamMapper`, `RecruitmentMapper`) serve as an **Anti-Corruption Layer (ACL)** between `@/generated/prisma/client` and our Domain Layer. They ensure that database schema details never leak into business logic.

---

## Architectural Purpose & Core Responsibilities

### 1. Decoupling Persistence from Domain Models
* **Prisma Types are Anemic Data Containers:** Prisma-generated types represent rows and columns in PostgreSQL. They contain no methods, invariants, or domain behavior.
* **Domain Models are Rich Objects:** Domain Entities (`User`, `JobListing`) enforce business rules, invariants, and encapsulate state modification.
* By using static mapper classes, our application use cases and domain models never import or depend on Prisma.

### 2. Reconstituting Value Objects (VOs)
Databases store primitives (e.g., `VARCHAR`, `BOOLEAN`, `TIMESTAMP`). The mapper is responsible for wrapping these raw database fields into strict Domain Value Objects during reconstitution:
* Identity wrappers: `UserId`, `AccountId`, `JobListingId`
* Domain rules wrappers: `Email`, `RoleCode`, `SalaryRange`, `CompanyWebsite`
* Composite security state: `MfaConfiguration`, `FailedLoginState`

### 3. Assembling Aggregate Roots
When querying relational data (e.g., a `User` with their `Role`, `Account`, and active `Sessions`), Prisma returns nested relation properties (`PrismaUserWithRelations`). The mapper iterates over these child records and reassembles the complete Aggregate Root in a single pass.

---

## Pattern Implementation & Examples

### 1. Handling Nullable Relations & Fallback States (`IamMapper`)
When mapping an optional database relation or nullable columns, the mapper explicitly handles missing records without throwing runtime errors:
* If `raw.account` is `null`, it passes `null` to the entity constructor.
* If MFA fields are absent, it initializes a clean null object via `MfaConfiguration.empty()`.
* If a one-to-many relation (`sessions`) is missing or undefined, it defaults to an empty array `[]`.

```typescript
import {
	Account as PrismaAccount,
	Role as PrismaRole,
	Session as PrismaSession,
	User as PrismaUser,
} from "@/generated/prisma/client";
import { Account, Role, Session, User } from "@/iam/domain/entities";
import {
	AccountId,
	Email,
	FailedLoginState,
	MfaConfiguration,
	RoleCode,
	RoleId,
	SessionId,
	UserId,
} from "@/iam/domain/value-objects";

type PrismaUserWithRelations = PrismaUser & {
	role: PrismaRole;
	account: PrismaAccount | null;
	sessions: PrismaSession[];
};

export class IamMapper {
	public static toDomain(raw: PrismaUserWithRelations): User {
		const role = new Role(
			new RoleId(raw.role.id),
			new RoleCode(raw.role.code),
			raw.role.description,
		);

		//! Gracefully fallback to empty MFA state if account relation is null
		const mfaConfiguration = raw.account
			? new MfaConfiguration(
					raw.account.isMfaEnabled ?? false,
					raw.account.mfaSecret ?? null,
					raw.account.mfaPendingSecret ?? null,
					raw.account.mfaBackupCodes ?? [],
				)
			: MfaConfiguration.empty();

		const account = raw.account
			? new Account(
					new AccountId(raw.account.id),
					raw.account.passwordHash,
					raw.account.verificationToken,
					raw.account.verificationTokenExpiresAt,
					raw.account.resetToken,
					raw.account.resetTokenExpiresAt,
					raw.account.scheduledForDeletionAt,
					new FailedLoginState(raw.account.failedLoginAttempts, raw.account.lockedUntil),
					mfaConfiguration,
				)
			: null;

		const sessions = Array.isArray(raw.sessions)
			? raw.sessions.map(
					(s) =>
						new Session(
							new SessionId(s.id),
							new UserId(s.userId),
							s.refreshTokenHash,
							s.userAgent,
							s.ipAddress,
							s.isRevoked,
							s.lastActiveAt,
							s.expiresAt,
							s.createdAt,
						),
				)
			: [];

		return new User(
			new UserId(raw.id),
			new Email(raw.email),
			raw.name,
			raw.isVerified,
			role,
			account,
			raw.image,
			raw.createdAt,
			raw.pendingEmail,
			sessions,
		);
	}
}
```

### 2. Conditionally Reconstituting Composite Value Objects (`RecruitmentMapper`)
Some Value Objects require multiple database columns to be non-null in order to be instantiated. For example, `SalaryRange` requires `salaryMin`, `salaryMax`, and `salaryCurrency`. The mapper evaluates these constraints before instantiating the VO:

```typescript
import {
	JobListing as PrismaJobListing,
} from "@/generated/prisma/client";
import { JobListing } from "@/recruitment/domain/entities";
import {
	EmployerId,
	JobListingId,
	JobLocation,
	SalaryRange,
} from "@/recruitment/domain/value-objects";

export class RecruitmentMapper {
	public static toJobListingDomain(raw: PrismaJobListing): JobListing {
		const locationVo = new JobLocation(raw.locationType, raw.locationAddress);

		//! Reconstitute composite VO only when required database columns exist
		let salaryVo: SalaryRange | null = null;
		if (raw.salaryMin !== null && raw.salaryMax !== null) {
			salaryVo = new SalaryRange(raw.salaryMin, raw.salaryMax, raw.salaryCurrency);
		}

		return new JobListing(
			new JobListingId(raw.id),
			new EmployerId(raw.employerId),
			raw.title,
			raw.description,
			raw.requirements,
			raw.employmentType,
			locationVo,
			salaryVo,
			raw.status,
			raw.expiresAt,
			raw.createdAt,
			raw.updatedAt,
		);
	}
}
```

---

## Best Practices & Rules

1. **Static Pure Functions Only:** Infrastructure mappers should be classes with stateless `static` methods (`public static toDomain(raw: ...)`) that have zero side effects. Do not inject repositories, databases, or services into mappers.
2. **Never Export Prisma Types to Application/Domain Layers:** The return type of any `toDomain` mapper method must strictly be a Domain Entity or Value Object.
3. **No Business Logic Inside Mappers:** Mappers only translate structural formats. Do not perform validation checks or mutate values inside mappers; validation should occur either when instantiating the Value Objects or within the Domain Entity constructors.
4. **Define Explicit Composite Relation Types:** When mapping aggregates with joined tables, define an explicit TypeScript intersection type (e.g., `PrismaUserWithRelations`) to enforce strict compile-time checks on required ORM `include` queries.
