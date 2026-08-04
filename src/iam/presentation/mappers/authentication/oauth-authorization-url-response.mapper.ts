import { GetOAuthAuthUrlResult } from "@/iam/application/ports/inbound/authentication";
import { OAuthAuthorizationUrlResponseDto } from "../../dtos/authentication";

export class OAuthAuthorizationUrlResponseMapper {
	public static toDto(result: GetOAuthAuthUrlResult): OAuthAuthorizationUrlResponseDto {
		return {
			url: result.url,
			state: result.state,
		};
	}
}
