import { InvalidDomainStateException } from "../exceptions/domain.exception";

export class Account {
	constructor(
		public readonly id: string,
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
		if (this.verificationToken !== token)
			throw new InvalidDomainStateException("Invalid verification token.");

		if (!this.verificationTokenExpiresAt || this.verificationTokenExpiresAt < new Date())
			throw new InvalidDomainStateException(
				"Verification token has expired. Please request a new one.",
			);

		this.verificationToken = null;
		this.verificationTokenExpiresAt = null;
	}

	public updateVerificationToken(token: string, tokenExpiresInMs: number): void {
		this.verificationToken = token;
		this.verificationTokenExpiresAt = new Date(Date.now() + tokenExpiresInMs);
	}

	public restoreVerificationToken(token: string | null, expiresAt: Date | null): void {
		this.verificationToken = token;
		this.verificationTokenExpiresAt = expiresAt;
	}

	public updateResetToken(token: string, tokenExpiresInMs: number): void {
		this.resetToken = token;
		this.resetTokenExpiresAt = new Date(Date.now() + tokenExpiresInMs);
	}

	public restoreResetToken(): void {
		this.resetToken = null;
		this.resetTokenExpiresAt = null;
	}

	public updateRefreshTokenHash(hash: string | null): void {
		this.refreshTokenHash = hash;
	}
}
