import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AuthUserDto {
	@ApiProperty()
	public readonly id!: string;

	@ApiProperty()
	public readonly email!: string;

	@ApiProperty()
	public readonly name!: string;

	@ApiProperty()
	public readonly role!: string;

	@ApiProperty()
	public readonly hasPassword!: boolean;
}

export class LoginResponseDto {
	@ApiProperty({ description: "Indicates if the user must complete MFA verification." })
	public readonly mfaRequired!: boolean;

	@ApiPropertyOptional({ description: "Issued ONLY if mfaRequired is true." })
	public readonly mfaChallengeToken?: string;

	@ApiPropertyOptional({
		description: "The JWT access token. Issued ONLY if mfaRequired is false.",
	})
	public readonly accessToken?: string;

	@ApiPropertyOptional({
		type: AuthUserDto,
		description:
			"Profile information of the authenticated user. Issued ONLY if mfaRequired is false.",
	})
	public readonly user?: AuthUserDto;
}
