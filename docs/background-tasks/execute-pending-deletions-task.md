# NestJS Schedule Integration: Execute Pending Account Deletions

## Overview
To comply with data privacy standards (such as GDPR/CCPA), account deletions in the IAM module operate on a 14-day grace period (Soft Delete). We utilize `@nestjs/schedule` to run a daily background task that permanently wipes accounts (Hard Delete) once their scheduled grace period has expired.

This task acts as the orchestrator for cross-module cleanups, utilizing Integration Events to safely remove assets (like Cloudinary images and resumes) before executing the final PostgreSQL database cascade.

## Prerequisites & Installation
Ensure the NestJS schedule package is installed and `ScheduleModule` is registered in your root `AppModule` (see Job Expiration documentation for setup).

## The Task Service
The task queries the database for any accounts where the `scheduledForDeletionAt` date has passed and executes the hard deletion use case. 

**Location:** `src/iam/infrastructure/tasks/execute-pending-deletions.task.ts`

```typescript
import { ExecuteHardDeletionUseCasePort } from "@/iam/application/ports/inbound/account/tasks";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ExecutePendingDeletionsTask {
	constructor(
		private readonly executeHardDeletionUseCase: ExecuteHardDeletionUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	//! Runs automatically at midnight every day
	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	public async handleCron(): Promise<void> {
		this.logger.log("Running scheduled task: Execute pending deletions...");
		await this.executeHardDeletionUseCase.execute();
	}
}
```

## Architecture Flow
1. **Trigger:** `ExecutePendingDeletionsTask` fires at midnight.
2. **Application Layer:** `ExecuteHardDeletionUseCase` fetches all users where `account.scheduledForDeletionAt <= now`.
3. **Integration Event:** Before deleting anything from the DB, the Use Case publishes the `UserAccountDeletingIntegrationEvent`. The Recruitment module catches this and deletes associated external assets (e.g., Cloudinary uploads) to prevent orphaned files.
4. **Domain Layer:** The `user.delete()` domain method is called, which registers the `UserAccountDeletedDomainEvent` into the aggregate's internal queue.
5. **Persistence:** The `UserRepository` executes the database transaction, permanently wiping the user and their account credentials.
6. **Domain Event Dispatch:** `DomainEventPublisher` broadcasts the domain events collected in Step 4.
7. **Side Effects:** The `UserAccountDeletedListener` catches the event and queues the final "Farewell" notification email via BullMQ.

## Module Registration
The Task service must be registered as a provider within the IAM module.

**Location:** `src/iam/iam.module.ts`

```typescript
import { ExecutePendingDeletionsTask } from "./infrastructure/tasks";

@Module({
	providers: [
		// ... existing providers and use cases
		ExecutePendingDeletionsTask,
	],
})
export class IamModule {}
```

## Testing Locally
To verify the Hard Delete execution locally:
1. Schedule an account for deletion via the frontend or API.
2. Temporarily adjust the grace period in `ScheduleAccountDeletionUseCase` to a short window (e.g., 30 seconds).
3. Change the `@Cron` decorator to run every minute:
```typescript
@Cron(CronExpression.EVERY_MINUTE)
```
*Note: Always remember to revert the grace period and the CRON expression back to production standards before committing.*
