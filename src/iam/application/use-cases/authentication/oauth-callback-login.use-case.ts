import { OAuthAccount, Session, User } from "@/iam/domain/entities";
import { RoleRepository, UserRepository } from "@/iam/domain/repositories";
import {
	Email,
	OAuthAccountId,
	OAuthProvider,
	RoleCode,
	SessionId,
	UserId,
} from "@/iam/domain/value-objects";
import { IdGeneratorPort } from "@/shared/utils/ports";
import { Injectable } from "@nestjs/common";
import {
	AccountPendingDeletionException,
	DefaultRoleMissingException,
	OAuthEmailNotProvidedException,
} from "../../exceptions";
import {
	LoginResult,
	OAuthCallbackLoginCommand,
	OAuthCallbackLoginUseCasePort,
} from "../../ports/inbound/authentication";
import {
	EnvConfigPort,
	HashServicePort,
	JwtServicePort,
	OAuthProviderPort,
	TimeFormatterPort,
} from "../../ports/outbound";

@Injectable()
export class OAuthCallbackLoginUseCase implements OAuthCallbackLoginUseCasePort {
	constructor(
		private readonly oauthProvider: OAuthProviderPort,
		private readonly userRepository: UserRepository,
		private readonly roleRepository: RoleRepository,
		private readonly jwtService: JwtServicePort,
		private readonly hashService: HashServicePort,
		private readonly idGenerator: IdGeneratorPort,
		private readonly envConfig: EnvConfigPort,
		private readonly timeFormatter: TimeFormatterPort,
	) {}

	public async execute(command: OAuthCallbackLoginCommand): Promise<LoginResult> {
		/**
		 * STEP1: Exchange Code for Profile
		 * The infrastructure layer makes the HTTP calls to exchange the authorization code
		 * for an access token, then uses that token to fetch the user's profile.
		 */
		const profile = await this.oauthProvider.exchangeCodeForProfile(command.provider, command.code);
		if (!profile.email) throw new OAuthEmailNotProvidedException();

		/**
		 * STEP2: Check for Existing Linked Account
		 * See if this exact social identity (e.g., Google user ID 12345) is already
		 * linked to a user in our database.
		 */
		let user = await this.userRepository.findByOAuth(command.provider, profile.providerAccountId);

		/**
		 * STEP3: Handle Account Linking or New User Registration
		 * If no user is explicitly linked to this social identity, we must either link
		 * it to an existing email match or create a brand new user.
		 */
		if (!user) {
			/**
			 * STEP3.1: Check if the user exists via another method (password signup or another OAuth provider).
			 */
			const emailVo = new Email(profile.email);
			user = await this.userRepository.findByEmail(emailVo);

			/**
			 * STEP3.2: Prepare the new OAuthAccount domain entity.
			 */
			const oauthProviderVo = new OAuthProvider(command.provider);
			const oauthAccountIdStr = this.idGenerator.generateId();
			const oauthAccountId = new OAuthAccountId(oauthAccountIdStr);

			const newOAuthAccount = new OAuthAccount(
				oauthAccountId,
				user ? user.id : new UserId(this.idGenerator.generateId()),
				oauthProviderVo,
				profile.providerAccountId,
			);

			if (user) {
				/**
				 * STEP3.3: Auto-Linking
				 * The email exists in our system. Trust the OAuth provider's email verification
				 * and link this new social account to the existing user aggregate.
				 */
				user.linkOAuthAccount(newOAuthAccount);
			} else {
				/**
				 * STEP3.4: OAuth-First Registration
				 * The email is entirely new. We fetch the default role and use the domain factory
				 * to instantiate an auto-verified user without a password.
				 */
				const roleCodeVo = new RoleCode("APPLICANT");
				const defaultRole = await this.roleRepository.findByCode(roleCodeVo);

				if (!defaultRole) throw new DefaultRoleMissingException();

				const emptyAccountId = this.idGenerator.generateId();

				user = User.createForOAuthRegistration(
					newOAuthAccount.getUserId().getValue(),
					emptyAccountId,
					profile.email,
					profile.name,
					profile.image,
					defaultRole,
					newOAuthAccount,
				);
			}

			/**
			 * STEP3.5: Persist the newly linked account or the newly created user.
			 */
			await this.userRepository.save(user);
		}

		/**
		 * STEP4: Security & Access Checks
		 * Ensure the user hasn't scheduled their account for deletion.
		 */
		if (user.account) {
			const scheduledForDeletionDate = user.account.getScheduledForDeletionAt();
			if (scheduledForDeletionDate)
				throw new AccountPendingDeletionException(scheduledForDeletionDate);
		}

		/**
		 * STEP5: Security & Access Checks
		 * Intercept the login flow if the user has Multi-Factor Authentication enabled.
		 */
		if (user.isMfaEnabled()) {
			const mfaChallengeToken = await this.jwtService.signMfaChallengeToken({
				sub: user.id.getValue(),
				email: user.email.getValue(),
				type: "MFA_CHALLENGE",
			});

			return { mfaRequired: true, mfaChallengeToken };
		}

		/**
		 * STEP6: Session Creation & Token Generation
		 * Issue the standard JWT access token and refresh token.
		 */
		const sessionIdStr = this.idGenerator.generateId();

		const tokens = await this.jwtService.generateTokens({
			sub: user.id.getValue(),
			email: user.email.getValue(),
			role: user.role.code.getValue(),
			sessionId: sessionIdStr,
		});

		/**
		 * STEP6.1: Hash the refresh token before storing it in the database for security.
		 */
		const refreshTokenHash = await this.hashService.hash(tokens.refreshToken, 10);
		const expiresInEnv = this.envConfig.getRefreshTokenExpiration();
		const expiresInMs = this.timeFormatter.parseToMilliseconds(expiresInEnv);
		const expiresAt = new Date(Date.now() + expiresInMs);

		/**
		 * STEP6.2: Append the new session to the User aggregate and save to the database.
		 */
		const session = new Session(
			new SessionId(sessionIdStr),
			user.id,
			refreshTokenHash,
			command.userAgent ?? null,
			command.ipAddress ?? null,
			false,
			new Date(),
			expiresAt,
			new Date(),
		);

		user.addSession(session);
		await this.userRepository.save(user);

		/**
		 * STEP6.3: Return Standardized Login Result
		 */
		return {
			mfaRequired: false,
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken,
			user: {
				id: user.id.getValue(),
				email: user.email.getValue(),
				name: user.name,
				role: user.role.code.getValue(),
				hasPassword: user.account?.hasPassword() ?? false,
			},
		};
	}
}
