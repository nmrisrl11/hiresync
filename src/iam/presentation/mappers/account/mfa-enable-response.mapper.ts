import { MfaEnableResponseDto } from "../../dtos/responses/account";

export class MfaEnableResponseMapper {
	public static toDto(result: { backupCodes: string[] }): MfaEnableResponseDto {
		return {
			backupCodes: result.backupCodes,
		};
	}
}
