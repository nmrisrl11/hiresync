import { InvalidOAuthProviderException } from "../exceptions";
import { OAUTH_PROVIDER, OAuthProviderType } from "../types";

export class OAuthProvider {
	private static readonly VALID_PROVIDERS: ReadonlySet<string> = new Set(
		Object.values(OAUTH_PROVIDER),
	);

	constructor(private readonly value: OAuthProviderType) {
		const upper = value.toUpperCase();

		if (!OAuthProvider.VALID_PROVIDERS.has(upper)) throw new InvalidOAuthProviderException(value);

		this.value = upper as OAuthProviderType;
	}

	public getValue(): OAuthProviderType {
		return this.value;
	}

	public equals(other: OAuthProvider): boolean {
		return this.value === other.getValue();
	}
}
