import { ApiProperty } from "@nestjs/swagger";

export class VerifyEmailUserDto {
	@ApiProperty()
	public readonly id!: string;

	@ApiProperty()
	public readonly email!: string;

	@ApiProperty()
	public readonly name!: string;

	@ApiProperty()
	public readonly role!: string;
}

export class VerifyEmailResponseDto {
	@ApiProperty({ description: "The JWT access token." })
	public readonly accessToken!: string;

	@ApiProperty({ type: VerifyEmailUserDto })
	public readonly user!: VerifyEmailUserDto;
}
