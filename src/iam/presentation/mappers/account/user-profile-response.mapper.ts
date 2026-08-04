import { UserResult } from "@/iam/application/ports/inbound/users";
import { UserProfileResponseDto } from "../../dtos/account";

export class UserProfileResponseMapper {
	public static toDto(user: UserResult): UserProfileResponseDto {
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
