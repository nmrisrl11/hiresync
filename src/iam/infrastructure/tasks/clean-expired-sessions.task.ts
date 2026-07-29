import { CleanExpiredSessionsUseCasePort } from "@/iam/application/ports/inbound/account/tasks";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class CleanExpiredSessionsTask {
	constructor(
		private readonly cleanExpiredSessionsUseCase: CleanExpiredSessionsUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	//! Runs automatically at 2:00 AM every day
	@Cron(CronExpression.EVERY_DAY_AT_2AM)
	public async handleCron(): Promise<void> {
		this.logger.log("Running scheduled task: Clean expired sessions...");
		await this.cleanExpiredSessionsUseCase.execute();
	}
}
