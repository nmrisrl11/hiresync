# Background Task: Clean Expired Sessions

## Overview
To prevent database bloat and maintain optimal query performance on the `Session` table, the IAM module runs an automated cleanup process. 

Every time a user logs in, verifies their email, or refreshes a token, a new `Session` record is generated with a 7-day expiration (`expiresAt`). Over time, inactive or naturally expired sessions accumulate in PostgreSQL. Instead of querying or filtering around dead records indefinitely, a scheduled CRON job systematically sweeps the database and hard-deletes any session where `expiresAt` is in the past.

## Clean Architecture & Decoupling
To strictly adhere to Domain-Driven Design and Clean Architecture principles, the background task **does not** directly inject database repositories or Prisma clients. 

Instead, the task service acts purely as a trigger (similar to an HTTP Controller or Event Listener) and delegates the entire workflow through an Inbound Port and Application Use Case:

* **Trigger (Infrastructure Layer):** `CleanExpiredSessionsTask` listens to the NestJS `@Cron()` schedule and invokes `CleanExpiredSessionsUseCasePort`.
* **Business Logic (Application Layer):** `CleanExpiredSessionsUseCase` generates the current timestamp (`NOW()`), invokes the repository contract, and logs the execution results via `LoggerPort`.
* **Persistence (Domain & Infrastructure Layers):** `UserRepository` defines the `deleteExpiredSessions(date: Date)` contract, which is executed via `PrismaUserRepository` using a performant bulk `deleteMany` query.

## Execution Workflow

1. **Schedule Trigger:** At exactly **2:00 AM every day** (`0 2 * * *`), the NestJS `@Cron(CronExpression.EVERY_DAY_AT_2AM)` decorator fires `CleanExpiredSessionsTask.handleCron()`.
2. **Use Case Execution:** The task calls `CleanExpiredSessionsUseCase.execute()`.
3. **Database Purge:** The Use Case passes the current `Date` object to `UserRepository.deleteExpiredSessions(now)`.
4. **Bulk Deletion:** Prisma executes the following SQL query under the hood:
   ```sql
   DELETE FROM "Session" WHERE "expiresAt" < NOW();
   ```
5. **Logging:** 
   - If records are removed: Logs an info message stating the exact count of purged sessions (e.g., *"Successfully purged 142 expired session(s)."*).
   - If zero records are removed: Logs an info message stating *"No expired sessions found to purge."*
   - If an exception occurs: Catches the error and logs a detailed stack trace via `LoggerPort.error()` without crashing the Node.js process.

## Why Schedule at 2:00 AM?
The task is scheduled for 2:00 AM daily to prevent resource contention and database lock contention with other background jobs:
* It avoids overlapping with `ExecutePendingDeletionsTask` (which runs at midnight, `0 0 * * *`).
* It runs during off-peak traffic hours, ensuring bulk `DELETE` operations do not impact read/write performance for active user logins.
