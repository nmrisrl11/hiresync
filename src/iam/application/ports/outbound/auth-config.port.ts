export abstract class AuthConfigPort {
	abstract getVerificationTokenExpiration(): string;
	abstract getPasswordResetTokenExpiration(): string;
	abstract getRefreshTokenExpiration(): string;
}
