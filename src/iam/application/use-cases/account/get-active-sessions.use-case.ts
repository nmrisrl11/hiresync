import { Injectable } from "@nestjs/common";
import {
	ActiveSessionResult,
	GetActiveSessionsQuery,
	GetActiveSessionsUseCasePort,
} from "../../ports/inbound/account";
import { UserId } from "@/iam/domain/value-objects";
import { UserNotFoundException } from "../../exceptions";
import { UserRepository } from "@/iam/domain/repositories";

@Injectable()
export class GetActiveSessionsUseCase implements GetActiveSessionsUseCasePort {
	constructor(private readonly userRepository: UserRepository) {}

	public async execute(
		query: GetActiveSessionsQuery,
		currentSessionId: string,
	): Promise<ActiveSessionResult[]> {
		const userIdVo = new UserId(query.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user) throw new UserNotFoundException();

		const activeSessions = user.getActiveSessions();

		return activeSessions
			.map((session) => ({
				id: session.id.getValue(),
				userAgent: session.userAgent,
				ipAddress: session.ipAddress,
				lastActiveAt: session.getLastActiveAt(),
				isCurrentDevice: session.id.getValue() === currentSessionId,
			}))
			.sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime());
	}
}
