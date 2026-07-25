import { CleanupRecruitmentDataUseCasePort } from "@/recruitment/application/ports/inbound/system";
import { UserAccountDeletingIntegrationEvent } from "@/shared/infrastructure/events/integration";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class UserAccountDeletingListener {
	constructor(
		private readonly cleanupRecruitmentDataUseCase: CleanupRecruitmentDataUseCasePort,
		private readonly logger: LoggerPort,
	) {}

	@OnEvent(UserAccountDeletingIntegrationEvent.name, { async: true, promisify: true })
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
