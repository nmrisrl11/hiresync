import { env } from "@/env";
import { AuthConfigPort } from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EnvAuthConfigAdapter implements AuthConfigPort {
	public getVerificationTokenExpiration(): string {
		return env.VERIFICATION_TOKEN_EXPIRES_IN;
	}

	public getPasswordResetTokenExpiration(): string {
		return env.PASSWORD_RESET_TOKEN_EXPIRES_IN;
	}

	public getRefreshTokenExpiration(): string {
		return env.JWT_REFRESH_EXPIRES_IN;
	}
}
