export abstract class EnvConfigPort {
	abstract getVerificationTokenExpiration(): string;
	abstract getPasswordResetTokenExpiration(): string;
	abstract getRefreshTokenExpiration(): string;
	abstract getGracePeriodAccountDeletion(): string;
	abstract getMaxLoginAttempts(): number;
	abstract getAccountLockoutDuration(): string;
}
