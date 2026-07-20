import { JwtPayload } from "@/shared/application/types";

export type JwtTokens = {
	accessToken: string;
	refreshToken: string;
};

export abstract class JwtServicePort {
	abstract generateTokens(payload: JwtPayload): Promise<JwtTokens>;
	abstract verifyRefreshToken(token: string): Promise<JwtPayload>;
}
