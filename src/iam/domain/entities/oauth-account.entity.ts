import { OAuthProviderType } from "../types";
import { OAuthAccountId, OAuthProvider, UserId } from "../value-objects";

export class OAuthAccount {
	constructor(
		public readonly id: OAuthAccountId,
		private readonly userId: UserId,
		private readonly provider: OAuthProvider,
		private readonly providerAccountId: string,
	) {}

	public getUserId(): UserId {
		return this.userId;
	}

	public getProvider(): OAuthProvider {
		return this.provider;
	}

	public getProviderAccountId(): string {
		return this.providerAccountId;
	}

	public matches(provider: OAuthProvider, providerAccountId: string): boolean {
		return this.provider.equals(provider) && this.providerAccountId === providerAccountId;
	}

	public getProviderValue(): OAuthProviderType {
		return this.provider.getValue();
	}
}
