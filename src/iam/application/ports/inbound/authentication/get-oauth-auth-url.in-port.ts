import { OAuthProviderType } from "@/iam/domain/types";

export class GetOAuthAuthUrlCommand {
	constructor(public readonly provider: OAuthProviderType) {}
}

export interface GetOAuthAuthUrlResult {
	url: string;
	state: string;
}

export abstract class GetOAuthAuthUrlUseCasePort {
	abstract execute(command: GetOAuthAuthUrlCommand): Promise<GetOAuthAuthUrlResult>;
}
