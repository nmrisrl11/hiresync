import { RestoreAccountResult } from "@/iam/application/ports/inbound/authentication";
import { RestoreAccountResponseDto } from "../../dtos/authentication";

export class RestoreAccountResponseMapper {
	public static toDto(result: RestoreAccountResult): RestoreAccountResponseDto {
		return {
			accessToken: result.accessToken,
		};
	}
}
