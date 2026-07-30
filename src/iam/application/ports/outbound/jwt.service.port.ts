import { JwtPayload } from "@/shared/types";

export type JwtTokens = {
	accessToken: string;
	refreshToken: string;
};

export type MfaChallengePayload = {
	sub: string;
	email: string;
	type: "MFA_CHALLENGE";
};

export abstract class JwtServicePort {
	abstract generateTokens(payload: JwtPayload): Promise<JwtTokens>;
	abstract verifyRefreshToken(token: string): Promise<JwtPayload>;
	abstract signMfaChallengeToken(payload: MfaChallengePayload): Promise<string>;
	abstract verifyMfaChallengeToken(token: string): Promise<MfaChallengePayload>;
}
