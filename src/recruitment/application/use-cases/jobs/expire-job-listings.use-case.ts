import { JobListingRepository } from "@/recruitment/domain/repositories";
import { DomainEventPublisherPort } from "@/shared/application/ports/outbound";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { ExpireJobListingsUseCasePort } from "../../ports/inbound/jobs";

@Injectable()
export class ExpireJobListingsUseCase implements ExpireJobListingsUseCasePort {
	constructor(
		private readonly jobListingRepository: JobListingRepository,
		private readonly domainEventPublisher: DomainEventPublisherPort,
		private readonly logger: LoggerPort,
	) {}

	public async execute(): Promise<void> {
		const now = new Date();
		const expirableJobs = await this.jobListingRepository.findExpirableListings(now);

		if (expirableJobs.length === 0) return;

		this.logger.log(`Found ${expirableJobs.length} job(s) to expire.`);

		for (const job of expirableJobs) {
			try {
				job.expire();

				await this.jobListingRepository.save(job);
				await this.domainEventPublisher.publishMultipleAsync(job.domainEvents);

				job.clearEvents();
				this.logger.log(`Successfully expired job ID: ${job.id.getValue()}`);
			} catch {
				this.logger.error(`Failed to expire job ID: ${job.id.getValue()}`);
				// Continue to the next job even if one fails
			}
		}
	}
}
