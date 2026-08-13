import { CleanupRecruitmentDataUseCasePort } from "@/recruitment/application/ports/inbound/system";
import { EVENT_NAMES, UserAccountDeletingIntegrationEvent } from "@/shared/events";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class UserAccountDeletingListener {
	constructor(
		private readonly cleanupRecruitmentDataUseCase: CleanupRecruitmentDataUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(EVENT_NAMES.USER_ACCOUNT_DELETING, { async: true, promisify: true })
	public async handle(event: UserAccountDeletingIntegrationEvent): Promise<void> {
		try {
			await this.cleanupRecruitmentDataUseCase.execute(event.userId);
		} catch (error) {
			this.logger.error(
				`Failed to clean up recruitment assets for user ${event.userId}`,
				error instanceof Error ? error.stack : "Unknown error",
			);
		}
	}
}
