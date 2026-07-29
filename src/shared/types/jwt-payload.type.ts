export type JwtPayload = {
	sub: string;
	email: string;
	role: string;
	sessionId: string; //! Required to track which device/session this token belongs to
	iat?: number;
	exp?: number;
};
