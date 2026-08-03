import {
	ProviderAccountAlreadyLinkedException,
	UserNotFoundException,
} from "@/iam/application/exceptions";
import {
	LinkOAuthProviderCommand,
	LinkOAuthProviderUseCasePort,
} from "@/iam/application/ports/inbound/account/oauth";
import { OAuthProviderPort } from "@/iam/application/ports/outbound";
import { OAuthAccount } from "@/iam/domain/entities";
import { UserRepository } from "@/iam/domain/repositories";
import { OAuthAccountId, OAuthProvider, UserId } from "@/iam/domain/value-objects";
import { IdGeneratorPort } from "@/shared/utils/ports";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LinkOAuthProviderUseCase implements LinkOAuthProviderUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly oauthProvider: OAuthProviderPort,
		private readonly idGenerator: IdGeneratorPort,
	) {}

	public async execute(command: LinkOAuthProviderCommand): Promise<void> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);
		if (!user) throw new UserNotFoundException();

		const profile = await this.oauthProvider.exchangeCodeForProfile(command.provider, command.code);

		const existingUser = await this.userRepository.findByOAuth(
			command.provider,
			profile.providerAccountId,
		);

		if (existingUser && !existingUser.id.equals(user.id))
			throw new ProviderAccountAlreadyLinkedException(
				`This ${command.provider} account is already linked to another user.`,
			);

		const oauthAccountIdStr = this.idGenerator.generateId();
		const oauthAccount = new OAuthAccount(
			new OAuthAccountId(oauthAccountIdStr),
			user.id,
			new OAuthProvider(command.provider),
			profile.providerAccountId,
		);

		user.linkOAuthAccount(oauthAccount);

		await this.userRepository.save(user);
	}
}
