import { OAuthProviderType } from "@/iam/domain/types";

export class LinkOAuthProviderCommand {
	constructor(
		public readonly userId: string,
		public readonly provider: OAuthProviderType,
		public readonly code: string,
	) {}
}

export abstract class LinkOAuthProviderUseCasePort {
	abstract execute(command: LinkOAuthProviderCommand): Promise<void>;
}
