import { PublicUserResult } from "@/iam/application/ports/inbound/users";
import { PublicUserProfileResponseDto } from "../../dtos/users";

export class PublicUserProfileResponseMapper {
	public static toDto(result: PublicUserResult): PublicUserProfileResponseDto {
		return {
			id: result.id,
			name: result.name,
			image: result.image,
			role: result.role,
		};
	}
}
