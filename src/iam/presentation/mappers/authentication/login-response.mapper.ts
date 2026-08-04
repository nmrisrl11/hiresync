import { LoginResult } from "@/iam/application/ports/inbound/authentication";
import { LoginResponseDto } from "../../dtos/authentication";

export class LoginResponseMapper {
	public static toDto(result: LoginResult): LoginResponseDto {
		return {
			mfaRequired: result.mfaRequired,
			mfaChallengeToken: result.mfaChallengeToken,
			accessToken: result.accessToken,
			user: result.user
				? {
						id: result.user.id,
						email: result.user.email,
						name: result.user.name,
						role: result.user.role,
						hasPassword: result.user.hasPassword,
					}
				: undefined,
		};
	}
}
