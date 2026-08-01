# Architecture: Domain vs. Application Exceptions

## Overview
In our Clean Architecture and Domain-Driven Design (DDD) implementation, exceptions are treated as explicit domain and use-case outcomes rather than generic runtime errors. We enforce a strict separation between **Domain Exceptions** (business rule violations and invariant failures) and **Application Exceptions** (use-case orchestration, authorization, and workflow failures).

By separating exceptions by architectural layer, we ensure that:
1. Our core **Domain Models** remain 100% agnostic to HTTP, frameworks, and infrastructure.
2. The **Application Layer** orchestrates execution flows cleanly and can reuse Domain Exceptions without duplicating validation logic.
3. The **Presentation Layer** (`IamExceptionFilter`) can map business outcomes uniformly to standard HTTP response codes without leaking internal implementation details.

---

## Architecture & Exception Hierarchy

```text
               ┌────────────────────────┐
               │  ApplicationException  │ (Base class for workflow/use-case errors)
               └───────────┬────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌──────────────────────────┐
│ InvalidLoginException   │ │ InvalidMfaChallenge...   │ (Application Exceptions)
└─────────────────────────┘ └──────────────────────────┘

               ┌────────────────────────┐
               │    DomainException     │ (Base class for invariant/rule errors)
               └───────────┬────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌──────────────────────────┐
│ InvalidMfaTokenException│ │ AccountLockedException   │ (Domain Exceptions)
└─────────────────────────┘ └──────────────────────────┘
```

### 1. Domain Exceptions (`src/<module>/domain/exceptions/`)
**Domain Exceptions** represent violations of core business rules, entity invariants, or invalid value object states. They are thrown exclusively by:
* **Entities & Aggregate Roots** (e.g., trying to consume a backup code when MFA is not enabled).
* **Value Objects** (e.g., passing a malformed string to an `Email` or `SalaryRange` value object).
* **Domain Services** (pure domain logic that spans multiple entities).

**Key Characteristics:**
* Inherit from `DomainException` (or `ApplicationException` if unifying base error codes across layers).
* Have zero knowledge of HTTP status codes, Express, or NestJS (`@nestjs/common`).
* Explain *why* a business rule failed in the ubiquitous language of the domain.

### 2. Application Exceptions (`src/<module>/application/exceptions/`)
**Application Exceptions** represent failures in use-case orchestration, user authorization, workflow state, or integration step validation. They are thrown by **Use Cases** and **Inbound/Outbound Adapters** when a request cannot proceed through the application workflow.

**Key Characteristics:**
* Inherit from `ApplicationException`.
* Represent orchestration and workflow halts (e.g., invalid challenge tokens, unauthorized access, or missing prerequisite resources).
* Must not import framework-specific HTTP exceptions (`UnauthorizedException` from `@nestjs/common`); HTTP mapping is strictly deferred to the Presentation Layer exception filter.

---

## When to Use Which Exception

| Scenario | Architectural Layer | Exception Type | Example |
| :--- | :--- | :--- | :--- |
| Email string format is invalid | **Domain** (Value Object) | `DomainException` | `InvalidEmailException` |
| MFA code is incorrect or recovery code invalid | **Domain** (Entity / VO) | `DomainException` | `InvalidMfaTokenException` |
| Account has exceeded failed login attempts | **Domain** (Entity) | `DomainException` | `AccountLockedException` |
| MFA challenge JWT token is expired or tampered with | **Application** (Use Case) | `ApplicationException` | `InvalidMfaChallengeException` |
| User provided incorrect email/password during login | **Application** (Use Case) | `ApplicationException` | `InvalidLoginException` |
| Action requires an authenticated session that is missing | **Application** (Use Case) | `ApplicationException` | `UnauthorizedSessionException` |

---

## Core Rule: Application Can Use (and Let Bubble Up) Domain Exceptions

A common misconception in Clean Architecture is that an Application Use Case must catch every `DomainException` and re-throw it as an `ApplicationException`. **This is an anti-pattern.**

### The Rule
1. **Use Cases can freely allow `DomainException` errors to bubble up to the Presentation Layer.**
2. **Use Cases should only catch a `DomainException` if they need to translate it into a specific workflow outcome or trigger a compensation transaction.**

### Why?
The Application Layer depends inward on the Domain Layer. Therefore, a Use Case is fully permitted to allow entity invariant exceptions (like `InvalidMfaTokenException` or `AccountLockedException`) to propagate naturally. Forcing a Use Case to wrap every Domain Exception creates redundant boilerplate code and obscures the root business rule violation.

```text
[Frontend / API Client]
         ▲
         │ (HTTP 400 / 401 via Exception Filter)
         │
[Presentation Layer: IamExceptionFilter]
         ▲
         │ (Catches both DomainException and ApplicationException directly)
         │
[Application Layer: MfaLoginUseCase]
         ▲
         │ (Allows InvalidMfaTokenException to bubble up without catching it)
         │
[Domain Layer: Account / MfaService] ──► throws InvalidMfaTokenException
```

---

## Code Implementation Examples

### 1. Domain Exception Example (`InvalidMfaTokenException`)
Thrown when an invariant or security verification fails during domain validation.

```typescript
import { ApplicationException } from "@/shared/core";

export class InvalidMfaTokenException extends ApplicationException {
	constructor(message = "Invalid MFA code or backup recovery code.") {
		super(message, "INVALID_MFA_TOKEN");
	}
}
```

### 2. Application Exception Example (`InvalidMfaChallengeException`)
Thrown when an orchestration or authentication challenge workflow fails inside a Use Case.

```typescript
import { ApplicationException } from "@/shared/core";

export class InvalidMfaChallengeException extends ApplicationException {
	constructor(message = "Invalid or expired MFA challenge token.") {
		super(message, "INVALID_MFA_CHALLENGE");
	}
}
```

### 3. Use Case Exception Flow (`MfaLoginUseCase`)
Notice how the use case throws an **Application Exception** (`InvalidMfaChallengeException`) for workflow failures, but allows **Domain Exceptions** (`InvalidMfaTokenException`) to either be thrown directly or bubble up from domain evaluations.

```typescript
import { InvalidMfaTokenException } from "@/iam/domain/exceptions";
import { InvalidLoginException, InvalidMfaChallengeException } from "../../exceptions";
import {
	MfaLoginCommand,
	MfaLoginResult,
	MfaLoginUseCasePort,
} from "../../ports/inbound/authentication";
import {
	EnvConfigPort,
	HashServicePort,
	JwtServicePort,
	MfaChallengePayload,
	MfaServicePort,
	TimeFormatterPort,
} from "../../ports/outbound";

export class MfaLoginUseCase implements MfaLoginUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtServicePort,
		private readonly mfaService: MfaServicePort,
		private readonly hashService: HashServicePort,
	) {}

	public async execute(command: MfaLoginCommand): Promise<MfaLoginResult> {
		let payload: MfaChallengePayload;
		try {
			//! 1. Workflow failure: throw APPLICATION Exception
			payload = await this.jwtService.verifyMfaChallengeToken(command.mfaChallengeToken);
			if (payload.type !== "MFA_CHALLENGE") throw new Error();
		} catch {
			throw new InvalidMfaChallengeException();
		}

		const userIdVo = new UserId(payload.sub);
		const user = await this.userRepository.findById(userIdVo);

		if (!user || !user.account || !user.isMfaEnabled()) {
			//! 2. Authentication orchestration failure: throw APPLICATION Exception
			throw new InvalidLoginException("Authentication failed.");
		}

		const mfaConfig = user.account.getMfaConfiguration();
		const secret = mfaConfig.getSecret();

		if (!secret) {
			//! 3. Corrupted security state: throw DOMAIN Exception
			throw new InvalidMfaTokenException("MFA configuration is invalid.");
		}

		const isTotpValid = this.mfaService.verifyTotpToken(secret, command.code);

		if (!isTotpValid) {
			let isBackupCodeValid = false;
			const backupCodes = mfaConfig.getBackupCodes();

			for (const hashedCode of backupCodes) {
				const matches = await this.hashService.compare(command.code, hashedCode);
				if (matches) {
					isBackupCodeValid = true;
					user.consumeMfaBackupCode(hashedCode);
					break;
				}
			}

			if (!isBackupCodeValid) {
				//! 4. Token verification failure: throw DOMAIN Exception
				throw new InvalidMfaTokenException("Invalid MFA code or backup recovery code.");
			}
		}

		// ... proceed with session creation and token generation ...
	}
}
```

---

## Presentation Layer Mapping (`IamExceptionFilter`)

The Presentation Layer is the **only** layer aware of HTTP protocols. The `IamExceptionFilter` intercepts both `DomainException` and `ApplicationException` instances thrown by the Use Case and maps their error codes (`INVALID_MFA_CHALLENGE`, `INVALID_MFA_TOKEN`) to the correct HTTP status codes (`401 Unauthorized`, `400 Bad Request`).

```typescript
import {
	InvalidLoginException,
	InvalidMfaChallengeException,
} from "@/iam/application/exceptions";
import {
	InvalidMfaTokenException,
} from "@/iam/domain/exceptions";
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch(InvalidMfaChallengeException, InvalidMfaTokenException, InvalidLoginException)
export class IamExceptionFilter implements ExceptionFilter {
	public catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		let status = HttpStatus.BAD_REQUEST;

		//! Map both Domain and Application exceptions to HTTP responses cleanly
		switch (exception.code) {
			case "INVALID_MFA_CHALLENGE":
			case "INVALID_MFA_TOKEN":
			case "INVALID_LOGIN":
				status = HttpStatus.UNAUTHORIZED;
				break;
			default:
				status = HttpStatus.BAD_REQUEST;
				break;
		}

		response.status(status).json({
			statusCode: status,
			error: exception.name,
			message: exception.message,
			code: exception.code,
		});
	}
}
```
