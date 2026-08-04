import { OAuthProviderType } from "@/iam/domain/types";
import { ConnectedProvidersResponseDto } from "../../dtos/account";

export class ConnectedProvidersResponseMapper {
	public static toDto(providers: OAuthProviderType[]): ConnectedProvidersResponseDto {
		return { providers };
	}
}
