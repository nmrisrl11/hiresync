import { ExpireJobListingsUseCasePort } from "@/recruitment/application/ports/inbound/jobs";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ExpireJobListingsTask {
	constructor(
		private readonly expireJobListingsUseCase: ExpireJobListingsUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	//! Runs automatically at midnight every day
	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	public async handleCron(): Promise<void> {
		this.logger.log("Running scheduled task: Expiring job listings...");
		await this.expireJobListingsUseCase.execute();
	}
}
