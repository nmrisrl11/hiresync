import { ApiProperty } from "@nestjs/swagger";

export class OAuthLinkUrlResponseDto {
	@ApiProperty({ description: "The secure authorization URL to redirect the user to." })
	public readonly authorizationUrl!: string;
}
