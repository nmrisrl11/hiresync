import { UserResult } from "@/iam/application/ports/inbound/users";
import { AdminUserResponseDto } from "../../dtos/admin";

export class AdminUserResponseMapper {
	public static toDto(user: UserResult): AdminUserResponseDto {
		return {
			id: user.id,
			email: user.email,
			name: user.name,
			image: user.image,
			role: user.role,
			isVerified: user.isVerified,
			hasPassword: user.hasPassword,
			createdAt: user.createdAt,
		};
	}
}
