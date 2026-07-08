export type JwtPayload = {
	sub: string;
	email: string;
	role: string;
};

export type GeneratedTokens = {
	accessToken: string;
	refreshToken: string;
};

export abstract class JwtServicePort {
	abstract generateTokens(payload: JwtPayload): Promise<GeneratedTokens>;
}
