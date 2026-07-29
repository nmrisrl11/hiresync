import {
	ExpiredResetTokenException,
	ExpiredVerificationTokenException,
	InvalidResetTokenException,
	InvalidVerificationTokenException,
} from "../exceptions";
import { AccountId, FailedLoginState } from "../value-objects";

export class Account {
	constructor(
		public readonly id: AccountId,
		private passwordHash: string,
		private verificationToken: string | null,
		private verificationTokenExpiresAt: Date | null,
		private resetToken: string | null = null,
		private resetTokenExpiresAt: Date | null = null,
		private scheduledForDeletionAt: Date | null = null,
		private failedLoginState: FailedLoginState = new FailedLoginState(),
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

	public getScheduledForDeletionAt(): Date | null {
		return this.scheduledForDeletionAt;
	}

	public scheduleDeletion(gracePeriodMs: number): void {
		this.scheduledForDeletionAt = new Date(Date.now() + gracePeriodMs);
	}

	public cancelDeletion(): void {
		this.scheduledForDeletionAt = null;
	}

	public getFailedLoginState(): FailedLoginState {
		return this.failedLoginState;
	}

	public isLocked(): boolean {
		if (this.failedLoginState.isLocked()) return true;

		//! If the lock has naturally expired based on time, silently clear the state
		if (this.failedLoginState.getLockedUntil() !== null)
			this.failedLoginState = this.failedLoginState.reset();

		return false;
	}

	public handleFailedLogin(maxAttempts: number, lockoutDurationMs: number): void {
		this.failedLoginState = this.failedLoginState.recordFailure(maxAttempts, lockoutDurationMs);
	}

	public resetFailedLogins(): void {
		if (this.failedLoginState.getCount() > 0 || this.failedLoginState.getLockedUntil() !== null)
			this.failedLoginState = this.failedLoginState.reset();
	}
}
