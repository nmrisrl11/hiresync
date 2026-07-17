import { NoAccountFoundException, NoPendingEmailChangeException } from "../exceptions";
import { Email } from "../value-objects";
import { Account } from "./account.entity";
import { Role } from "./role.entity";
import {
	EmailChangeRequestedDomainEvent,
	PasswordResetRequestedDomainEvent,
	UserEmailChangedDomainEvent,
	UserPasswordChangedDomainEvent,
	UserRegisteredDomainEvent,
	VerificationEmailResentDomainEvent,
} from "../events";
import { AggregateRoot } from "@/shared/domain/entities";

export class User extends AggregateRoot {
	constructor(
		public readonly id: string,
		public email: Email,
		public name: string,
		public isVerified: boolean,
		public readonly role: Role,
		public readonly account: Account | null,
		public image: string | null,
		public readonly createdAt: Date,
		public pendingEmail: string | null,
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
		const emailVo = new Email(emailString);
		const verificationTokenExpiration = new Date(Date.now() + verificationTokenTtlMs);

		const account = new Account(
			accountId,
			passwordHash,
			verificationToken,
			verificationTokenExpiration,
		);

		const createdAt = new Date();

		const user = new User(id, emailVo, name, false, role, account, null, createdAt, null);

		user.addDomainEvent(
			new UserRegisteredDomainEvent(emailString, verificationToken, verificationTokenTtlMs),
		);

		return user;
	}

	public verifyEmail(token: string): void {
		if (!this.account) throw new NoAccountFoundException();

		this.account.verify(token);
		this.isVerified = true;
	}

	public refreshVerificationToken(token: string, tokenExpiresInMs: number): void {
		if (!this.account) throw new NoAccountFoundException();
		this.account.updateVerificationToken(token, tokenExpiresInMs);

		this.addDomainEvent(
			new VerificationEmailResentDomainEvent(this.email.getValue(), token, tokenExpiresInMs),
		);
	}

	public setResetToken(token: string, tokenExpiresInMs: number): void {
		if (!this.account) throw new NoAccountFoundException();
		this.account.updateResetToken(token, tokenExpiresInMs);

		this.addDomainEvent(
			new PasswordResetRequestedDomainEvent(this.email.getValue(), token, tokenExpiresInMs),
		);
	}

	public updateRefreshToken(hash: string | null): void {
		if (!this.account) throw new NoAccountFoundException();
		this.account.updateRefreshTokenHash(hash);
	}

	public changePassword(token: string, password: string): void {
		if (!this.account) throw new NoAccountFoundException();
		this.account.updatePasswordHash(token, password);

		this.addDomainEvent(new UserPasswordChangedDomainEvent(this.email.getValue()));
	}

	public updatePassword(newHash: string): void {
		if (!this.account) throw new NoAccountFoundException();
		this.account.setPasswordHash(newHash);

		this.addDomainEvent(new UserPasswordChangedDomainEvent(this.email.getValue()));
	}

	public updateProfile(name?: string, image?: string | null): void {
		if (name !== undefined) this.name = name;

		if (image !== undefined) this.image = image;
	}

	public requestEmailChange(newEmail: string, token: string, tokenExpiresInMs: number): void {
		if (!this.account) throw new NoAccountFoundException();

		//! Set the pending email
		this.pendingEmail = newEmail;

		//! Generate new verification token
		this.account.updateVerificationToken(token, tokenExpiresInMs);

		this.addDomainEvent(new EmailChangeRequestedDomainEvent(newEmail, token, tokenExpiresInMs));
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

		this.addDomainEvent(new UserEmailChangedDomainEvent(oldEmail, this.email.getValue()));
	}
}
