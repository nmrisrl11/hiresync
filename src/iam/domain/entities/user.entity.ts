import { InvalidDomainStateException } from "../exceptions/domain.exception";
import { Email } from "../value-objects/email.value-object";
import { Account } from "./account.entity";
import { Role } from "./role.entity";

export class User {
	constructor(
		public readonly id: string,
		public readonly email: Email,
		public readonly name: string,
		public isVerified: boolean,
		public readonly role: Role,
		public readonly account: Account | null,
		public readonly image: string | null,
	) {}

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

		return new User(id, emailVo, name, false, role, account, null);
	}

	public verifyEmail(token: string): void {
		if (!this.account)
			throw new InvalidDomainStateException("User has no associated account credentials.");

		this.account.verify(token);
		this.isVerified = true;
	}

	public refreshVerificationToken(token: string, tokenExpiresInMs: number): void {
		if (!this.account)
			throw new InvalidDomainStateException("User has no associated account credentials.");
		this.account.updateVerificationToken(token, tokenExpiresInMs);
	}

	public rollbackVerificationToken(token: string | null, expiresAt: Date | null): void {
		this.account?.restoreVerificationToken(token, expiresAt);
	}

	public setResetToken(token: string, tokenExpiresInMs: number): void {
		if (!this.account)
			throw new InvalidDomainStateException("User has no associated account credentials.");
		this.account.updateResetToken(token, tokenExpiresInMs);
	}

	public rollbackResetToken(): void {
		this.account?.restoreResetToken();
	}
}
