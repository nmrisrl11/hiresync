import { MfaEnableResponseDto } from "../../dtos/account";

export class MfaEnableResponseMapper {
	public static toDto(result: { backupCodes: string[] }): MfaEnableResponseDto {
		return {
			backupCodes: result.backupCodes,
		};
	}
}
