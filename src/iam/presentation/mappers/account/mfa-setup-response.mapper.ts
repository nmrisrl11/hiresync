import { MfaSetupResponseDto } from "../../dtos/account/responses";

export class MfaSetupResponseMapper {
	public static toDto(result: { secret: string; qrCodeUrl: string }): MfaSetupResponseDto {
		return {
			secret: result.secret,
			qrCodeUrl: result.qrCodeUrl,
		};
	}
}
