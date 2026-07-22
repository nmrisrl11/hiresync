import { ExpireJobListingsUseCasePort } from "@/recruitment/application/ports/inbound/jobs";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ExpireJobListingsCron {
	private readonly logger = new Logger(ExpireJobListingsCron.name);

	constructor(private readonly expireJobListingsUseCase: ExpireJobListingsUseCasePort) {}

	//! Runs every hour to expire job listings that are past their expiration date
	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	public async handleCron(): Promise<void> {
		this.logger.log("Running scheduled task: Expiring job listings...");
		await this.expireJobListingsUseCase.execute();
	}
}
