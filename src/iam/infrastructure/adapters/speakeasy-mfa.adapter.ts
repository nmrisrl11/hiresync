import { GeneratedMfaSecret, MfaServicePort } from "@/iam/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import * as qrcode from "qrcode";
import * as speakeasy from "speakeasy";

@Injectable()
export class SpeakeasyMfaAdapter implements MfaServicePort {
	private readonly issuer = "HireSync";

	public async generateSecret(email: string): Promise<GeneratedMfaSecret> {
		const secret = speakeasy.generateSecret({
			name: `${this.issuer} (${email})`,
			issuer: this.issuer,
		});

		//! Generate a Base64 PNG QR Code data URI for frontend rendering
		const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

		return {
			secret: secret.base32,
			qrCodeUrl,
		};
	}
	public verifyTotpToken(secret: string, token: string): boolean {
		return speakeasy.totp.verify({
			secret,
			encoding: "base32",
			token,
			window: 1, //! Allows a 30-second skew window for slight clock drift
		});
	}
}
