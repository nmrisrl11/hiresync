import { VerifyEmailResult } from "@/iam/application/ports/inbound/authentication";
import { VerifyEmailResponseDto } from "../../dtos/authentication";

export class VerifyEmailResponseMapper {
	public static toDto(result: VerifyEmailResult): VerifyEmailResponseDto {
		return {
			accessToken: result.accessToken,
			user: {
				id: result.user.id,
				email: result.user.email,
				name: result.user.name,
				role: result.user.role,
			},
		};
	}
}
