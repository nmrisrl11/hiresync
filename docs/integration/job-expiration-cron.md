# NestJS Schedule Integration: Automated Job Expiration

## Overview
To automatically manage the lifecycle of job listings, we utilize the `@nestjs/schedule` package. This allows us to run a scheduled background task (CRON job) that checks for job listings that have passed their `expiresAt` date and safely transitions them to a `CLOSED` (or `EXPIRED`) state. 

By relying on our Domain-Driven Design (DDD) architecture, this scheduled task triggers the existing `JobListingClosedDomainEvent`, which seamlessly hooks into our notification queue to email the employer, requiring zero duplicate logic.

## Prerequisites & Installation
Ensure the NestJS schedule package is installed:
```bash
npm install @nestjs/schedule
```

Register the `ScheduleModule` at the root of the application (e.g., `AppModule`):
```typescript
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
	imports: [
		ScheduleModule.forRoot(),
		// ... other modules
	],
})
export class AppModule {}
```

## The CRON Service
The scheduler acts as an infrastructure trigger for our Application Use Case. We use the `EVERY_DAY_AT_MIDNIGHT` expression, which provides an efficient, lightweight daily check during off-peak hours to transition any jobs that expired that day.

**Location:** `src/recruitment/infrastructure/cron/expire-job-listings.cron.ts`

```typescript
import { ExpireJobListingsUseCasePort } from "@/recruitment/application/ports/inbound/jobs";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ExpireJobListingsCron {
	constructor(
		private readonly expireJobListingsUseCase: ExpireJobListingsUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	// Runs automatically at 00:00 every day
	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	public async handleCron(): Promise<void> {
		this.logger.log("Running scheduled task: Expiring job listings...");
		await this.expireJobListingsUseCase.execute();
	}
}
```

## Architecture Flow
1. **Trigger:** `ExpireJobListingsCron` fires at midnight.
2. **Application Layer:** `ExpireJobListingsUseCase` fetches all jobs where `status === PUBLISHED` and `expiresAt < now`.
3. **Domain Layer:** For each job, the `job.expire()` domain method is called, which updates the status and registers the `JobListingClosedDomainEvent`.
4. **Persistence:** The updated aggregate is saved via `JobListingRepository`.
5. **Event Dispatch:** `DomainEventDispatcher` fires the event.
6. **Side Effects:** The `JobListingClosedListener` catches the event and queues the notification email via BullMQ.

## Module Registration
The CRON service must be registered as a provider within the module that owns it.

**Location:** `src/recruitment/recruitment.module.ts`

```typescript
import { ExpireJobListingsCron } from "./infrastructure/cron/expire-job-listings.cron";

@Module({
	providers: [
		// ... existing providers and use cases
		ExpireJobListingsCron,
	],
})
export class RecruitmentModule {}
```

## Testing Locally
To test the CRON job locally without waiting for midnight, temporarily change the `@Cron` decorator to run frequently:

```typescript
// Runs every 10 seconds
@Cron("*/10 * * * * *")
```
*Note: Always remember to revert to `CronExpression.EVERY_DAY_AT_MIDNIGHT` before committing to version control.*
