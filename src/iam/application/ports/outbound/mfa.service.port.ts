export type GeneratedMfaSecret = {
	secret: string; //! Base32 secret string stored in database
	qrCodeUrl: string; //! Data URI (base64 image) to render on frontend
};

export abstract class MfaServicePort {
	abstract generateSecret(email: string): Promise<GeneratedMfaSecret>;
	abstract verifyTotpToken(secret: string, token: string): boolean;
}
