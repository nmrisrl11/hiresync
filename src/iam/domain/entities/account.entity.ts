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
}
