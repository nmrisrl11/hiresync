import { ApiProperty } from "@nestjs/swagger";

export class OAuthAuthorizationUrlResponseDto {
	@ApiProperty({ description: "The secure authorization URL to redirect the user to." })
	public readonly url!: string;

	@ApiProperty({ description: "The randomly generated CSRF state token." })
	public readonly state!: string;
}
