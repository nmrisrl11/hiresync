import { GetOAuthAuthUrlResult } from "@/iam/application/ports/inbound/authentication";
import { OAuthLinkUrlResponseDto } from "../../dtos/account/responses";

export class OAuthLinkUrlResponseMapper {
	public static toDto(result: GetOAuthAuthUrlResult): OAuthLinkUrlResponseDto {
		return {
			authorizationUrl: result.url,
		};
	}
}
