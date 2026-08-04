import { RefreshTokenResult } from "@/iam/application/ports/inbound/authentication";
import { RefreshResponseDto } from "../../dtos/authentication";

export class RefreshResponseMapper {
	public static toDto(result: RefreshTokenResult): RefreshResponseDto {
		return {
			accessToken: result.accessToken,
		};
	}
}
