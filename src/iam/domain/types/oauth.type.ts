export const OAUTH_PROVIDER = {
	GOOGLE: "GOOGLE",
	GITHUB: "GITHUB",
	MICROSOFT: "MICROSOFT",
} as const;

export type OAuthProviderType = (typeof OAUTH_PROVIDER)[keyof typeof OAUTH_PROVIDER];
