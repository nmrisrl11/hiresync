import { CleanExpiredSessionsUseCasePort } from "@/iam/application/ports/inbound/account/tasks";
import { UserRepository } from "@/iam/domain/repositories";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CleanExpiredSessionsUseCase implements CleanExpiredSessionsUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly logger: LoggerPort,
	) {}

	public async execute(): Promise<void> {
		const now = new Date();

		try {
			const deletedCount = await this.userRepository.deleteExpiredSessions(now);

			if (deletedCount > 0) {
				this.logger.log(`Successfully purged ${deletedCount} expired session(s).`);
			} else {
				this.logger.log("No expired sessions found to purge.");
			}
		} catch (error) {
			this.logger.error("Failed to execute cleanup for expired sessions", (error as Error).stack);
		}
	}
}
