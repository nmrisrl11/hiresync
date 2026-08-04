import { MfaLoginResult } from "@/iam/application/ports/inbound/authentication";
import { LoginResponseDto } from "../../dtos/authentication";

export class MfaLoginResponseMapper {
	public static toDto(result: MfaLoginResult): LoginResponseDto {
		return {
			mfaRequired: false,
			accessToken: result.accessToken,
			user: {
				id: result.user.id,
				email: result.user.email,
				name: result.user.name,
				role: result.user.role,
				hasPassword: result.user.hasPassword,
			},
		};
	}
}
