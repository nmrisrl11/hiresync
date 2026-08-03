import { OAuthProviderType } from "@/iam/domain/types";
import { ConnectedProvidersResponseDto } from "../../dtos/account/responses";

export class ConnectedProvidersResponseMapper {
	public static toDto(providers: OAuthProviderType[]): ConnectedProvidersResponseDto {
		return { providers };
	}
}
