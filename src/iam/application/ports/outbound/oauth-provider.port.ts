import { OAuthProviderType } from "@/iam/domain/types";

export interface OAuthProfileDto {
	provider: OAuthProviderType;
	providerAccountId: string;
	email: string | null;
	name: string;
	image: string | null;
	isEmailVerified: boolean;
}

export abstract class OAuthProviderPort {
	//! Generates the secure OAuth authorization URL along with the CSRF state token
	abstract getAuthorizationUrl(provider: OAuthProviderType, state: string): Promise<string>;

	//! Exchanges the authorization code for access tokens and fetches the user's provider profile
	abstract exchangeCodeForProfile(
		provider: OAuthProviderType,
		code: string,
	): Promise<OAuthProfileDto>;
}
