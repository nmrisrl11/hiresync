import { AggregateRoot } from "@/shared/core";
import {
	EmailChangeRequestedDomainEvent,
	UserAccountDeletedDomainEvent,
	UserAccountDeletionScheduledDomainEvent,
	UserAccountRestoredDomainEvent,
	UserEmailChangedDomainEvent,
	UserMfaDisabledDomainEvent,
	UserMfaEnabledDomainEvent,
	UserPasswordChangedDomainEvent,
} from "../events";
import {
	AvatarRemovedDomainEvent,
	AvatarUploadedDomainEvent,
	InitialPasswordSetDomainEvent,
	UserProfileUpdatedDomainEvent,
} from "../events/account";
import {
	OAuthProviderLinkedDomainEvent,
	OAuthProviderUnlinkedDomainEvent,
} from "../events/account/oauth";
import {
	PasswordResetRequestedDomainEvent,
	UserEmailVerifiedDomainEvent,
	UserLoggedInDomainEvent,
	UserRegisteredDomainEvent,
	UserSessionRevokedDomainEvent,
	VerificationEmailResentDomainEvent,
} from "../events/authentication";
import { NoAccountFoundException, NoPendingEmailChangeException } from "../exceptions";
import { OAuthProviderType } from "../types";
import { AccountId, Email, SessionId, UserId } from "../value-objects";
import { Account } from "./account.entity";
import { OAuthAccount } from "./oauth-account.entity";
import { Role } from "./role.entity";
import { Session } from "./session.entity";

export class User extends AggregateRoot {
	constructor(
		public readonly id: UserId,
		public email: Email,
		public name: string,
		public isVerified: boolean,
		public readonly role: Role,
		public readonly account: Account | null,
		public image: string | null,
		public readonly createdAt: Date,
		public pendingEmail: string | null,
		private sessions: Session[] = [],
		private oauthAccounts: OAuthAccount[] = [],
	) {
		super();
	}

	public static createForRegistration(
		id: string,
		accountId: string,
		emailString: string,
		name: string,
		role: Role,
		passwordHash: string,
		verificationToken: string,
		verificationTokenTtlMs: number,
	): User {
		const idVo = new UserId(id);
		const accountIdVo = new AccountId(accountId);
		const emailVo = new Email(emailString);
		const verificationTokenExpiration = new Date(Date.now() + verificationTokenTtlMs);

		const account = new Account(
			accountIdVo,
			passwordHash,
			verificationToken,
			verificationTokenExpiration,
		);

		const createdAt = new Date();

		const user = new User(idVo, emailVo, name, false, role, account, null, createdAt, null);

		user.addDomainEvent(
			new UserRegisteredDomainEvent(id, emailString, verificationToken, verificationTokenTtlMs),
		);

		return user;
	}

	public verifyEmail(token: string): void {
		if (!this.account) throw new NoAccountFoundException();

		this.account.verify(token);
		this.isVerified = true;

		this.addDomainEvent(
			new UserEmailVerifiedDomainEvent(this.id.getValue(), this.email.getValue()),
		);
	}

	public refreshVerificationToken(token: string, tokenExpiresInMs: number): void {
		if (!this.account) throw new NoAccountFoundException();
		this.account.updateVerificationToken(token, tokenExpiresInMs);

		this.addDomainEvent(
			new VerificationEmailResentDomainEvent(
				this.id.getValue(),
				this.email.getValue(),
				token,
				tokenExpiresInMs,
			),
		);
	}

	public setResetToken(token: string, tokenExpiresInMs: number): void {
		if (!this.account) throw new NoAccountFoundException();
		this.account.updateResetToken(token, tokenExpiresInMs);

		this.addDomainEvent(
			new PasswordResetRequestedDomainEvent(
				this.id.getValue(),
				this.email.getValue(),
				token,
				tokenExpiresInMs,
			),
		);
	}

	public changePassword(token: string, password: string): void {
		if (!this.account) throw new NoAccountFoundException();
		this.account.updatePasswordHash(token, password);

		this.addDomainEvent(
			new UserPasswordChangedDomainEvent(this.id.getValue(), this.email.getValue()),
		);
	}

	public updatePassword(newHash: string): void {
		if (!this.account) throw new NoAccountFoundException();

		//! Check if this is the first time a password is being set (OAuth account scenario)
		const isInitialPassword = !this.account.hasPassword();

		this.account.setPasswordHash(newHash);

		//! Dispatch the appropriate event
		if (isInitialPassword) {
			this.addDomainEvent(new InitialPasswordSetDomainEvent(this.id.getValue()));
		} else {
			this.addDomainEvent(
				new UserPasswordChangedDomainEvent(this.id.getValue(), this.email.getValue()),
			);
		}
	}

	public updateProfile(name?: string, image?: string | null): void {
		const nameChanged = name !== undefined && name !== this.name;
		const imageChanged = image !== undefined && image !== this.image;

		if (name !== undefined) this.name = name;
		if (image !== undefined) this.image = image;

		//! Handle Profile (Name) Updates
		if (nameChanged) {
			this.addDomainEvent(
				new UserProfileUpdatedDomainEvent(this.id.getValue(), nameChanged, imageChanged),
			);
		}

		//! Handle Avatar Uploads / Removals
		if (imageChanged) {
			if (this.image === null) {
				this.addDomainEvent(new AvatarRemovedDomainEvent(this.id.getValue()));
			} else {
				this.addDomainEvent(new AvatarUploadedDomainEvent(this.id.getValue(), this.image));
			}
		}
	}

	public requestEmailChange(newEmail: string, token: string, tokenExpiresInMs: number): void {
		if (!this.account) throw new NoAccountFoundException();

		//! Set the pending email
		this.pendingEmail = newEmail;

		//! Generate new verification token
		this.account.updateVerificationToken(token, tokenExpiresInMs);

		this.addDomainEvent(
			new EmailChangeRequestedDomainEvent(this.id.getValue(), newEmail, token, tokenExpiresInMs),
		);
	}

	public confirmEmailChange(token: string): void {
		if (!this.account) throw new NoAccountFoundException();
		if (!this.pendingEmail) throw new NoPendingEmailChangeException();

		const oldEmail = this.email.getValue();

		//! Verify the token
		this.account.verify(token);

		//! Apply the new email and clear the pending state
		this.email = new Email(this.pendingEmail);
		this.pendingEmail = null;

		this.addDomainEvent(
			new UserEmailChangedDomainEvent(this.id.getValue(), oldEmail, this.email.getValue()),
		);
	}

	public delete(): void {
		this.addDomainEvent(
			new UserAccountDeletedDomainEvent(this.id.getValue(), this.email.getValue(), this.image),
		);
	}

	public scheduleDeletion(gracePeriodMs: number): void {
		if (!this.account) throw new NoAccountFoundException();

		this.account.scheduleDeletion(gracePeriodMs);

		this.addDomainEvent(
			new UserAccountDeletionScheduledDomainEvent(
				this.id.getValue(),
				this.email.getValue(),
				this.account.getScheduledForDeletionAt(),
			),
		);
	}

	public cancelDeletion(): void {
		if (!this.account) throw new NoAccountFoundException();

		this.account.cancelDeletion();

		this.addDomainEvent(
			new UserAccountRestoredDomainEvent(this.id.getValue(), this.email.getValue()),
		);
	}

	//! Session Management Methods
	public getSessions(): Session[] {
		return this.sessions;
	}

	public getActiveSessions(): Session[] {
		return this.sessions.filter((session) => session.isValid());
	}

	public addSession(session: Session): void {
		this.sessions.push(session);
		this.addDomainEvent(new UserLoggedInDomainEvent(this.id.getValue(), session.id.getValue()));
	}

	public revokeSession(sessionId: SessionId): void {
		const session = this.sessions.find((s) => s.id.equals(sessionId));
		if (session && session.isValid()) {
			session.revoke();
			this.addDomainEvent(
				new UserSessionRevokedDomainEvent(this.id.getValue(), session.id.getValue()),
			);
		}
	}

	public revokeAllSessions(): void {
		for (const session of this.sessions) {
			if (session.isValid()) {
				session.revoke();
				this.addDomainEvent(
					new UserSessionRevokedDomainEvent(this.id.getValue(), session.id.getValue()),
				);
			}
		}
	}

	public revokeAllOtherSessions(currentSessionId: SessionId): void {
		for (const session of this.sessions) {
			if (!session.id.equals(currentSessionId) && session.isValid()) {
				session.revoke();
				this.addDomainEvent(
					new UserSessionRevokedDomainEvent(this.id.getValue(), session.id.getValue()),
				);
			}
		}
	}

	//! MFA Methods
	public isMfaEnabled(): boolean {
		if (!this.account) throw new NoAccountFoundException();
		return this.account.isMfaEnabled();
	}

	public initiateMfaSetup(pendingSecret: string): void {
		if (!this.account) throw new NoAccountFoundException();
		this.account.initiateMfaSetup(pendingSecret);
	}

	public enableMfa(hashedBackupCodes: string[]): void {
		if (!this.account) throw new NoAccountFoundException();
		this.account.enableMfa(hashedBackupCodes);

		this.addDomainEvent(new UserMfaEnabledDomainEvent(this.id.getValue(), this.email.getValue()));
	}

	public disableMfa(): void {
		if (!this.account) throw new NoAccountFoundException();
		this.account.disableMfa();

		this.addDomainEvent(new UserMfaDisabledDomainEvent(this.id.getValue(), this.email.getValue()));
	}

	public consumeMfaBackupCode(matchedHashedCode: string): void {
		if (!this.account) throw new NoAccountFoundException();
		this.account.consumeMfaBackupCode(matchedHashedCode);
	}

	//! OAuth Methods

	//! Factory method for OAuth-first user registration (auto-verified, no password)
	public static createForOAuthRegistration(
		id: string,
		accountId: string,
		emailString: string,
		name: string,
		image: string | null,
		role: Role,
		oauthAccount: OAuthAccount,
	): User {
		const idVo = new UserId(id);
		const accountIdVo = new AccountId(accountId);
		const emailVo = new Email(emailString);

		//! Create an empty Account with null password and tokens since OAuth verifies email automatically
		const account = new Account(accountIdVo, null, null, null);

		const createdAt = new Date();

		const user = new User(
			idVo,
			emailVo,
			name,
			true, // Social provider emails are pre-verified
			role,
			account,
			image,
			createdAt,
			null,
			[],
			[oauthAccount],
		);

		user.addDomainEvent(
			new OAuthProviderLinkedDomainEvent(idVo.getValue(), oauthAccount.getProviderValue()),
		);

		return user;
	}

	public getOAuthAccounts(): OAuthAccount[] {
		return [...this.oauthAccounts];
	}

	public hasOAuthProvider(providerType: OAuthProviderType): boolean {
		return this.oauthAccounts.some((oauth) => oauth.getProviderValue() === providerType);
	}

	public linkOAuthAccount(oauthAccount: OAuthAccount): void {
		const alreadyLinked = this.oauthAccounts.some((existing) =>
			existing.matches(oauthAccount.getProvider(), oauthAccount.getProviderAccountId()),
		);

		if (!alreadyLinked) {
			this.oauthAccounts.push(oauthAccount);

			//! Emit event ONLY when a new account is successfully linked
			this.addDomainEvent(
				new OAuthProviderLinkedDomainEvent(this.id.getValue(), oauthAccount.getProviderValue()),
			);
		}
	}

	public unlinkOAuthProvider(providerType: OAuthProviderType): void {
		const hasPassword = this.account !== null && this.account.hasPassword();

		//! Capture the length before filtering
		const initialLength = this.oauthAccounts.length;

		const remainingProviders = this.oauthAccounts.filter(
			(oauth) => oauth.getProviderValue() !== providerType,
		);

		if (!hasPassword && remainingProviders.length === 0) {
			throw new Error("Cannot unlink the only authentication method on this account.");
		}

		this.oauthAccounts = remainingProviders;

		//! Emit event ONLY if the array size changed (meaning an account was actually removed)
		if (this.oauthAccounts.length !== initialLength) {
			this.addDomainEvent(new OAuthProviderUnlinkedDomainEvent(this.id.getValue(), providerType));
		}
	}
}
