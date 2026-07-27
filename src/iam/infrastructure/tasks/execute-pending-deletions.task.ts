import { ExecuteHardDeletionUseCasePort } from "@/iam/application/ports/inbound/account";
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
