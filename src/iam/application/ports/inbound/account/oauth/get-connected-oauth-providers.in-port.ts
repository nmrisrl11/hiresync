import { OAuthProviderType } from "@/iam/domain/types";

export abstract class GetConnectedOAuthProvidersUseCasePort {
	abstract execute(userId: string): Promise<OAuthProviderType[]>;
}
