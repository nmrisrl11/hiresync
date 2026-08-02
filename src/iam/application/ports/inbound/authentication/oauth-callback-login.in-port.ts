import { OAuthProviderType } from "@/iam/domain/types";
import { LoginResult } from "./login.in-port";

export class OAuthCallbackLoginCommand {
	constructor(
		public readonly provider: OAuthProviderType,
		public readonly code: string,
		public readonly state: string,
		public readonly userAgent?: string,
		public readonly ipAddress?: string,
	) {}
}

export abstract class OAuthCallbackLoginUseCasePort {
	abstract execute(command: OAuthCallbackLoginCommand): Promise<LoginResult>;
}
