import {
	ExpiredResetTokenException,
	ExpiredVerificationTokenException,
	InvalidResetTokenException,
	InvalidVerificationTokenException,
} from "../exceptions";
import { AccountId } from "../value-objects";

export class Account {
	constructor(
		public readonly id: AccountId,
		private passwordHash: string,
		private verificationToken: string | null,
		private verificationTokenExpiresAt: Date | null,
		private resetToken: string | null = null,
		private resetTokenExpiresAt: Date | null = null,
		private refreshTokenHash: string | null = null,
	) {}

	public getPasswordHash(): string {
		return this.passwordHash;
	}

	public getVerificationToken(): string | null {
		return this.verificationToken;
	}

	public getVerificationTokenExpiresAt(): Date | null {
		return this.verificationTokenExpiresAt;
	}

	public getResetToken(): string | null {
		return this.resetToken;
	}

	public getResetTokenExpiresAt(): Date | null {
		return this.resetTokenExpiresAt;
	}

	public getRefreshTokenHash(): string | null {
		return this.refreshTokenHash;
	}

	public verify(token: string): void {
		if (this.verificationToken !== token) throw new InvalidVerificationTokenException();

		if (!this.verificationTokenExpiresAt || this.verificationTokenExpiresAt < new Date())
			throw new ExpiredVerificationTokenException(
				"The verification token has expired. Please request a new one.",
			);

		this.verificationToken = null;
		this.verificationTokenExpiresAt = null;
	}

	public updateVerificationToken(token: string, tokenExpiresInMs: number): void {
		this.verificationToken = token;
		this.verificationTokenExpiresAt = new Date(Date.now() + tokenExpiresInMs);
	}

	public updateResetToken(token: string, tokenExpiresInMs: number): void {
		this.resetToken = token;
		this.resetTokenExpiresAt = new Date(Date.now() + tokenExpiresInMs);
	}

	public updateRefreshTokenHash(hash: string | null): void {
		this.refreshTokenHash = hash;
	}

	public updatePasswordHash(token: string, password: string) {
		if (this.resetToken !== token) throw new InvalidResetTokenException();

		if (!this.resetTokenExpiresAt || this.resetTokenExpiresAt < new Date())
			throw new ExpiredResetTokenException(
				"The password reset token has expired. Please request a new one.",
			);

		this.passwordHash = password;
		this.resetToken = null;
		this.resetTokenExpiresAt = null;
	}

	public setPasswordHash(newHash: string): void {
		this.passwordHash = newHash;
	}
}
