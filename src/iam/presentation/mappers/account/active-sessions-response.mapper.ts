import { ActiveSessionResult } from "@/iam/application/ports/inbound/account";
import { ActiveSessionsResponseDto } from "../../dtos/account";

export class ActiveSessionsResponseMapper {
	public static toDto(sessions: ActiveSessionResult[]): ActiveSessionsResponseDto {
		return {
			sessions: sessions.map((session) => ({
				id: session.id,
				userAgent: session.userAgent,
				ipAddress: session.ipAddress,
				lastActiveAt: session.lastActiveAt,
				isCurrentDevice: session.isCurrentDevice,
			})),
		};
	}
}
