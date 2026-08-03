import { OAuthProviderType } from "@/iam/domain/types";

export class UnlinkOAuthProviderCommand {
	constructor(
		public readonly userId: string,
		public readonly provider: OAuthProviderType,
	) {}
}

export abstract class UnlinkOAuthProviderUseCasePort {
	abstract execute(command: UnlinkOAuthProviderCommand): Promise<void>;
}
