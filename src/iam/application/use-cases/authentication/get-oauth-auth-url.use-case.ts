import { Injectable } from "@nestjs/common";
import {
	GetOAuthAuthUrlCommand,
	GetOAuthAuthUrlResult,
	GetOAuthAuthUrlUseCasePort,
} from "../../ports/inbound/authentication";
import { OAuthProviderPort, StateGeneratorPort } from "../../ports/outbound";

@Injectable()
export class GetOAuthAuthUrlUseCase implements GetOAuthAuthUrlUseCasePort {
	constructor(
		private readonly oauthProvider: OAuthProviderPort,
		private readonly stateGenerator: StateGeneratorPort,
	) {}

	public async execute(command: GetOAuthAuthUrlCommand): Promise<GetOAuthAuthUrlResult> {
		//! STEP 1: Generate CSRF State
		// We generate a secure, random state string. The presentation layer (controller)
		// will set this in an HttpOnly cookie and pass it to the provider to prevent
		// Cross-Site Request Forgery (CSRF) attacks during the callback phase.
		const state = this.stateGenerator.generateState();

		//! STEP 2: Construct the Authorization URL
		// We delegate the URL construction to the infrastructure adapter, which binds
		// the client ID, redirect URI, requested scopes, and our generated state.
		const url = await this.oauthProvider.getAuthorizationUrl(command.provider, state);

		//! STEP 3: Return Result
		// The controller uses the URL to redirect the user and the state to set the security cookie.
		return { url, state };
	}
}
