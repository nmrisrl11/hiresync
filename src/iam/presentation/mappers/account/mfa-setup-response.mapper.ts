import { MfaSetupResponseDto } from "../../dtos/responses/account";

export class MfaSetupResponseMapper {
	public static toDto(result: { secret: string; qrCodeUrl: string }): MfaSetupResponseDto {
		return {
			secret: result.secret,
			qrCodeUrl: result.qrCodeUrl,
		};
	}
}
