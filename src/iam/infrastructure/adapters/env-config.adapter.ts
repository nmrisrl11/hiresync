import { env } from "@/env";
import { EnvConfigPort } from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EnvConfigAdapter implements EnvConfigPort {
	public getVerificationTokenExpiration(): string {
		return env.VERIFICATION_TOKEN_EXPIRES_IN;
	}

	public getPasswordResetTokenExpiration(): string {
		return env.PASSWORD_RESET_TOKEN_EXPIRES_IN;
	}

	public getRefreshTokenExpiration(): string {
		return env.JWT_REFRESH_EXPIRES_IN;
	}

	public getGracePeriodAccountDeletion(): string {
		return env.GRACE_PERIOD_ACCOUNT_DELETION;
	}

	public getMaxLoginAttempts(): number {
		return env.MAX_LOGIN_ATTEMPTS;
	}

	public getAccountLockoutDuration(): string {
		return env.ACCOUNT_LOCKOUT_DURATION;
	}

	public getMfaChallengeTokenExpiration(): string {
		return env.MFA_CHALLENGE_TOKEN_EXPIRES_IN;
	}
}
