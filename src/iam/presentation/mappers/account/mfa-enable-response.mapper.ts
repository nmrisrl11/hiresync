import { MfaEnableResponseDto } from "../../dtos/account/responses";

export class MfaEnableResponseMapper {
	public static toDto(result: { backupCodes: string[] }): MfaEnableResponseDto {
		return {
			backupCodes: result.backupCodes,
		};
	}
}
