import { OAuthProviderType } from "@/iam/domain/types";
import { ApiProperty } from "@nestjs/swagger";

export class ConnectedProvidersResponseDto {
	@ApiProperty({
		enum: ["GOOGLE", "GITHUB", "MICROSOFT"],
		isArray: true,
		description: "List of connected OAuth provider types.",
	})
	public readonly providers!: OAuthProviderType[];
}
