import { ApiProperty } from "@nestjs/swagger";

export class MfaSetupResponseDto {
	@ApiProperty({ description: "The Base32 TOTP secret string." })
	public readonly secret!: string;

	@ApiProperty({ description: "The QR code data URL for scanning into authenticator apps." })
	public readonly qrCodeUrl!: string;
}
